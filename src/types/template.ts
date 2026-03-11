// Template colors for star marking
export type TemplateColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple';

// Color configuration with hex values and labels
export const TEMPLATE_COLORS: Record<TemplateColor, { hex: string; label: string }> = {
  yellow: { hex: '#FBBF24', label: '黄色' },
  green: { hex: '#34D399', label: '绿色' },
  blue: { hex: '#60A5FA', label: '蓝色' },
  red: { hex: '#F87171', label: '红色' },
  purple: { hex: '#A78BFA', label: '紫色' },
};

// All available template colors in order
export const TEMPLATE_COLOR_ORDER: TemplateColor[] = ['yellow', 'green', 'blue', 'red', 'purple'];

// Setting path identifiers for all modules
export type SettingPath =
  // Cropper settings
  | 'cropper.enablePerspective'
  | 'cropper.cropBlackBorder'
  | 'cropper.threshold'
  | 'cropper.extractInnerImage'
  // Cropper naming settings
  | 'cropper.useGlobalPrefix'
  | 'cropper.globalPrefix'
  | 'cropper.useDatePrefix'
  | 'cropper.useNumeric'
  | 'cropper.padding'
  | 'cropper.startNumber'
  // Gaussian settings
  | 'gaussian.polaroidSize'
  | 'gaussian.polaroidOffsetX'
  | 'gaussian.polaroidOffsetY'
  | 'gaussian.blurIntensity'
  | 'gaussian.brightness'
  | 'gaussian.bgScale'
  | 'gaussian.bgOffsetX'
  | 'gaussian.bgOffsetY'
  | 'gaussian.shadow'
  | 'gaussian.shadowBlur'
  | 'gaussian.shadowOpacity'
  | 'gaussian.ratio'
  | 'gaussian.bgType'
  | 'gaussian.bgColor'
  // Print settings
  | 'print.paperType'
  | 'print.orientation'
  | 'print.frameType'
  | 'print.imageMode'
  | 'print.columns'
  | 'print.gap'
  | 'print.padding'
  | 'print.showCutMarks'
  | 'print.cropAdjust';

// Module types
export type ModuleType = 'cropper' | 'gaussian' | 'print';

// Template structure
export interface Template {
  color: TemplateColor;
  name: string;
  // Each setting path maps to its value
  settings: Partial<Record<SettingPath, unknown>>;
  // Which modules are enabled (have at least one setting marked)
  enabledModules: {
    cropper: boolean;
    gaussian: boolean;
    print: boolean;
  };
}

// Helper to get module from setting path
export function getModuleFromPath(path: SettingPath): ModuleType {
  const [module] = path.split('.') as [ModuleType, string];
  return module;
}

// Helper to get setting key from path
export function getSettingKeyFromPath(path: SettingPath): string {
  const [, key] = path.split('.');
  return key;
}
