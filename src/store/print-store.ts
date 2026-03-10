import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PrintState, PrintImage, PrintSettings, LayoutResult, Position } from '@/types';
import { calculateLayout, calculateTotalPages, PAPER_SIZES } from '@/lib/picture-print-engine/layout';

interface PrintActions {
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  setImageOffset: (id: string, offset: Position) => void;
  selectImage: (id: string | null) => void;
  updateSettings: (settings: Partial<PrintSettings>) => void;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  recalculateLayout: () => void;
}

type PrintStore = PrintState & PrintActions;

const defaultSettings: PrintSettings = {
  paperType: 'a4',
  frameType: 'polaroid',
  imageMode: 'frame',
  columns: 3,
  gap: 2,
  padding: 10,
  showCutMarks: true,
};

export const usePrintStore = create<PrintStore>()(
  devtools(
    (set, get) => ({
      images: [],
      settings: defaultSettings,
      layout: null,
      currentPage: 0,
      selectedImageId: null,

      addImages: (files) => {
        const newImages: PrintImage[] = files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          offset: { x: 0, y: 0 },
        }));

        set((state) => ({
          images: [...state.images, ...newImages],
        }));

        get().recalculateLayout();
      },

      removeImage: (id) => {
        const image = get().images.find((img) => img.id === id);
        if (image) {
          URL.revokeObjectURL(image.url);
        }

        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
          selectedImageId: state.selectedImageId === id ? null : state.selectedImageId,
        }));

        get().recalculateLayout();
      },

      clearImages: () => {
        get().images.forEach((img) => URL.revokeObjectURL(img.url));
        set({ images: [], currentPage: 0, selectedImageId: null });
        get().recalculateLayout();
      },

      setImageOffset: (id, offset) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, offset } : img
          ),
        }));
      },

      selectImage: (id) => {
        set({ selectedImageId: id });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
        get().recalculateLayout();
      },

      setCurrentPage: (page) => {
        const { layout } = get();
        if (!layout) return;
        const maxPage = layout.totalPages - 1;
        set({ currentPage: Math.max(0, Math.min(page, maxPage)) });
      },

      nextPage: () => {
        const { currentPage, layout } = get();
        if (layout && currentPage < layout.totalPages - 1) {
          set({ currentPage: currentPage + 1 });
        }
      },

      prevPage: () => {
        const { currentPage } = get();
        if (currentPage > 0) {
          set({ currentPage: currentPage - 1 });
        }
      },

      recalculateLayout: () => {
        const { images, settings } = get();

        if (images.length === 0) {
          set({ layout: null, currentPage: 0 });
          return;
        }

        const paper = settings.customPaper || PAPER_SIZES[settings.paperType];

        const layout: LayoutResult = calculateLayout({
          paper: { ...paper, name: settings.paperType },
          frameType: settings.frameType,
          imageMode: settings.imageMode,
          columns: settings.columns,
          gap: settings.gap,
          padding: settings.padding,
        });

        layout.totalPages = calculateTotalPages(images.length, layout.perPage);

        set((state) => ({
          layout,
          currentPage: Math.min(state.currentPage, Math.max(0, layout.totalPages - 1)),
        }));
      },
    }),
    { name: 'print-store' }
  )
);
