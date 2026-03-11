import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  TemplateColor,
  SettingPath,
  Template,
} from '@/types/template';
import { TEMPLATE_COLOR_ORDER, getModuleFromPath, getSettingKeyFromPath } from '@/types/template';
import type { CropperSettings, PrintSettings } from '@/types';
import type { GaussianSettings } from './gaussian-store';

// Create empty template for a color
function createEmptyTemplate(color: TemplateColor): Template {
  return {
    color,
    name: '',
    settings: {},
    enabledModules: {
      cropper: false,
      gaussian: false,
      print: false,
    },
  };
}

// Initialize all template slots
function createInitialTemplates(): Record<TemplateColor, Template> {
  return {
    yellow: createEmptyTemplate('yellow'),
    green: createEmptyTemplate('green'),
    blue: createEmptyTemplate('blue'),
    red: createEmptyTemplate('red'),
    purple: createEmptyTemplate('purple'),
  };
}

interface TemplateState {
  // Each color has a template
  templates: Record<TemplateColor, Template>;
  // Currently active template color (for quick processing)
  activeColor: TemplateColor | null;
}

interface TemplateActions {
  // Assign a setting to a color template
  assignSetting: (path: SettingPath, color: TemplateColor, value: unknown) => void;
  // Remove a setting from all templates
  unassignSetting: (path: SettingPath) => void;
  // Get the color a setting is assigned to (if any)
  getSettingColor: (path: SettingPath) => TemplateColor | null;
  // Set the active template color
  setActiveColor: (color: TemplateColor | null) => void;
  // Check if a template has any settings
  hasTemplateSettings: (color: TemplateColor) => boolean;
  // Get merged settings for a template (for processing)
  getTemplateSettings: (color: TemplateColor) => {
    cropper: Partial<CropperSettings>;
    gaussian: Partial<GaussianSettings>;
    print: Partial<PrintSettings>;
  };
  // Get all colors that have templates
  getActiveTemplateColors: () => TemplateColor[];
  // Clear all settings from a template
  clearTemplate: (color: TemplateColor) => void;
}

type TemplateStore = TemplateState & TemplateActions;

export const useTemplateStore = create<TemplateStore>()(
  devtools(
    persist(
      (set, get) => ({
        templates: createInitialTemplates(),
        activeColor: null,

        assignSetting: (path, color, value) => {
          set((state) => {
            // First, remove this setting from any other template
            const newTemplates = { ...state.templates };

            for (const c of TEMPLATE_COLOR_ORDER) {
              if (c !== color && path in newTemplates[c].settings) {
                const { [path]: _, ...rest } = newTemplates[c].settings;
                newTemplates[c] = {
                  ...newTemplates[c],
                  settings: rest as Partial<Record<SettingPath, unknown>>,
                };
                // Update enabled modules for the template we're removing from
                newTemplates[c].enabledModules = updateEnabledModules(newTemplates[c].settings);
              }
            }

            // Add setting to the target template
            newTemplates[color] = {
              ...newTemplates[color],
              settings: {
                ...newTemplates[color].settings,
                [path]: value,
              },
            };

            // Update enabled modules
            newTemplates[color].enabledModules = updateEnabledModules(newTemplates[color].settings);

            return { templates: newTemplates };
          });
        },

        unassignSetting: (path) => {
          set((state) => {
            const newTemplates = { ...state.templates };

            for (const color of TEMPLATE_COLOR_ORDER) {
              if (path in newTemplates[color].settings) {
                const { [path]: _, ...rest } = newTemplates[color].settings;
                newTemplates[color] = {
                  ...newTemplates[color],
                  settings: rest as Partial<Record<SettingPath, unknown>>,
                  enabledModules: updateEnabledModules(rest as Partial<Record<SettingPath, unknown>>),
                };
              }
            }

            return { templates: newTemplates };
          });
        },

        getSettingColor: (path) => {
          const { templates } = get();
          for (const color of TEMPLATE_COLOR_ORDER) {
            if (path in templates[color].settings) {
              return color;
            }
          }
          return null;
        },

        setActiveColor: (color) => {
          set({ activeColor: color });
        },

        hasTemplateSettings: (color) => {
          const { templates } = get();
          return Object.keys(templates[color].settings).length > 0;
        },

        getTemplateSettings: (color) => {
          const { templates } = get();
          const template = templates[color];

          const cropper: Partial<CropperSettings> = {};
          const gaussian: Partial<GaussianSettings> = {};
          const print: Partial<PrintSettings> = {};

          for (const [path, value] of Object.entries(template.settings)) {
            const module = getModuleFromPath(path as SettingPath);
            const key = getSettingKeyFromPath(path as SettingPath);

            switch (module) {
              case 'cropper':
                (cropper as Record<string, unknown>)[key] = value;
                break;
              case 'gaussian':
                (gaussian as Record<string, unknown>)[key] = value;
                break;
              case 'print':
                (print as Record<string, unknown>)[key] = value;
                break;
            }
          }

          return { cropper, gaussian, print };
        },

        getActiveTemplateColors: () => {
          const { templates } = get();
          return TEMPLATE_COLOR_ORDER.filter(
            (color) => Object.keys(templates[color].settings).length > 0
          );
        },

        clearTemplate: (color) => {
          set((state) => ({
            templates: {
              ...state.templates,
              [color]: createEmptyTemplate(color),
            },
          }));
        },
      }),
      {
        name: 'template-storage',
        partialize: (state) => ({
          templates: state.templates,
        }),
      }
    ),
    { name: 'template-store' }
  )
);

// Helper to update enabled modules based on settings
function updateEnabledModules(
  settings: Partial<Record<SettingPath, unknown>>
): Template['enabledModules'] {
  const modules: Template['enabledModules'] = {
    cropper: false,
    gaussian: false,
    print: false,
  };

  for (const path of Object.keys(settings) as SettingPath[]) {
    const module = getModuleFromPath(path);
    modules[module] = true;
  }

  return modules;
}
