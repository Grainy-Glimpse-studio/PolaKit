import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9' | 'custom';
export type BgType = 'blur' | 'solid' | 'image' | 'video';

export interface Preset {
  name: string;
  ratio: AspectRatio;
  polaroidSize: number;
  blurIntensity: number;
  brightness: number;
  shadow: boolean;
}

export interface GaussianSettings {
  ratio: AspectRatio;
  customRatioW: number;
  customRatioH: number;
  polaroidSize: number;
  polaroidOffsetX: number;
  polaroidOffsetY: number;
  bgType: BgType;
  blurIntensity: number;
  bgScale: number;
  bgOffsetX: number;
  bgOffsetY: number;
  brightness: number;
  bgColor: string;
  shadow: boolean;
  shadowBlur: number;
  shadowOpacity: number;
  resolution: number;
}

export interface GaussianImage {
  id: string;
  file: File;
  url: string;
  settings?: Partial<GaussianSettings>;
}

export interface GaussianState {
  images: GaussianImage[];
  currentIndex: number;
  applyMode: 'all' | 'single';
  settings: GaussianSettings;
  customPresets: Record<string, Preset>;
  activePreset: string | null;
}

interface GaussianActions {
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setCurrentIndex: (index: number) => void;
  nextImage: () => void;
  prevImage: () => void;
  setApplyMode: (mode: 'all' | 'single') => void;
  updateSettings: (settings: Partial<GaussianSettings>) => void;
  updateImageSettings: (id: string, settings: Partial<GaussianSettings>) => void;
  applyPreset: (presetKey: string) => void;
  saveCustomPreset: (name: string) => void;
  deleteCustomPreset: (key: string) => void;
  reset: () => void;
}

export const DEFAULT_PRESETS: Record<string, Preset> = {
  instagram: {
    name: 'Instagram',
    ratio: '1:1',
    polaroidSize: 70,
    blurIntensity: 30,
    brightness: 100,
    shadow: true,
  },
  story: {
    name: 'Story',
    ratio: '9:16',
    polaroidSize: 60,
    blurIntensity: 40,
    brightness: 90,
    shadow: true,
  },
  minimal: {
    name: 'Minimal',
    ratio: '1:1',
    polaroidSize: 80,
    blurIntensity: 20,
    brightness: 110,
    shadow: false,
  },
  dramatic: {
    name: 'Dramatic',
    ratio: '4:5',
    polaroidSize: 65,
    blurIntensity: 50,
    brightness: 80,
    shadow: true,
  },
};

const defaultSettings: GaussianSettings = {
  ratio: '1:1',
  customRatioW: 4,
  customRatioH: 3,
  polaroidSize: 70,
  polaroidOffsetX: 0,
  polaroidOffsetY: 0,
  bgType: 'blur',
  blurIntensity: 30,
  bgScale: 100,
  bgOffsetX: 0,
  bgOffsetY: 0,
  brightness: 100,
  bgColor: '#ffffff',
  shadow: true,
  shadowBlur: 25,
  shadowOpacity: 35,
  resolution: 2160,
};

type GaussianStore = GaussianState & GaussianActions;

export const useGaussianStore = create<GaussianStore>()(
  devtools(
    persist(
      (set, get) => ({
        images: [],
        currentIndex: 0,
        applyMode: 'all',
        settings: defaultSettings,
        customPresets: {},
        activePreset: null,

        addImages: (files) => {
          const newImages: GaussianImage[] = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
          }));
          set((state) => ({
            images: [...state.images, ...newImages],
          }));
        },

        removeImage: (id) => {
          const image = get().images.find((img) => img.id === id);
          if (image) URL.revokeObjectURL(image.url);
          set((state) => ({
            images: state.images.filter((img) => img.id !== id),
            currentIndex: Math.min(state.currentIndex, Math.max(0, state.images.length - 2)),
          }));
        },

        clearImages: () => {
          get().images.forEach((img) => URL.revokeObjectURL(img.url));
          set({ images: [], currentIndex: 0 });
        },

        setCurrentIndex: (index) => {
          const { images } = get();
          set({ currentIndex: Math.max(0, Math.min(index, images.length - 1)) });
        },

        nextImage: () => {
          const { currentIndex, images } = get();
          if (currentIndex < images.length - 1) {
            set({ currentIndex: currentIndex + 1 });
          }
        },

        prevImage: () => {
          const { currentIndex } = get();
          if (currentIndex > 0) {
            set({ currentIndex: currentIndex - 1 });
          }
        },

        setApplyMode: (mode) => set({ applyMode: mode }),

        updateSettings: (newSettings) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
            activePreset: null,
          }));
        },

        updateImageSettings: (id, newSettings) => {
          set((state) => ({
            images: state.images.map((img) =>
              img.id === id
                ? { ...img, settings: { ...img.settings, ...newSettings } }
                : img
            ),
          }));
        },

        applyPreset: (presetKey) => {
          const preset = DEFAULT_PRESETS[presetKey] || get().customPresets[presetKey];
          if (preset) {
            set((state) => ({
              settings: {
                ...state.settings,
                ratio: preset.ratio,
                polaroidSize: preset.polaroidSize,
                blurIntensity: preset.blurIntensity,
                brightness: preset.brightness,
                shadow: preset.shadow,
              },
              activePreset: presetKey,
            }));
          }
        },

        saveCustomPreset: (name) => {
          const { settings } = get();
          const key = `custom_${Date.now()}`;
          set((state) => ({
            customPresets: {
              ...state.customPresets,
              [key]: {
                name,
                ratio: settings.ratio,
                polaroidSize: settings.polaroidSize,
                blurIntensity: settings.blurIntensity,
                brightness: settings.brightness,
                shadow: settings.shadow,
              },
            },
            activePreset: key,
          }));
        },

        deleteCustomPreset: (key) => {
          set((state) => {
            const { [key]: _, ...rest } = state.customPresets;
            return {
              customPresets: rest,
              activePreset: state.activePreset === key ? null : state.activePreset,
            };
          });
        },

        reset: () => set({ settings: defaultSettings, activePreset: null }),
      }),
      {
        name: 'gaussian-storage',
        partialize: (state) => ({
          settings: state.settings,
          customPresets: state.customPresets,
        }),
      }
    )
  )
);
