export type AccentColor = {
  r: number;
  g: number;
  b: number;
  hex: string;
};

export type PhotoAsset = {
  src: string;
  width: number;
  height: number;
  bytes: number;
};

export type PhotoItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  caption: string | null;
  originalName: string;
  importedAt: string;
  accent: AccentColor;
  sizes: {
    card: PhotoAsset;
    detail: PhotoAsset;
  };
};

export type GalleryManifest = {
  generatedAt: string;
  count: number;
  items: PhotoItem[];
};
