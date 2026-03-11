const STORAGE_KEY = 'gaussian-bg-images';
const MAX_IMAGES = 10;

export interface StoredImage {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
}

export function getStoredImages(): StoredImage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as StoredImage[];
  } catch {
    return [];
  }
}

export function saveImage(name: string, dataUrl: string): StoredImage {
  const images = getStoredImages();

  const newImage: StoredImage = {
    id: crypto.randomUUID(),
    name,
    dataUrl,
    createdAt: Date.now(),
  };

  // Add to beginning, keep only MAX_IMAGES
  const updatedImages = [newImage, ...images].slice(0, MAX_IMAGES);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));

  return newImage;
}

export function deleteStoredImage(id: string): void {
  const images = getStoredImages();
  const updatedImages = images.filter((img) => img.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
