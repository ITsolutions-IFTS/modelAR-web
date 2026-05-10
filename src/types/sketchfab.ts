// ─── Sketchfab API v3 types ───────────────────────────────────────────────────

export interface SketchfabThumbnail {
  uid: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

export interface SketchfabUser {
  uid: string;
  username: string;
  displayName: string;
  profileUrl: string;
}

export interface SketchfabLicense {
  uid: string;
  label: string;
}

export interface SketchfabCategory {
  name: string;
  slug: string;
  uri: string;
}

export interface SketchfabModel {
  uid: string;
  name: string;
  description: string | null;
  viewerUrl: string;
  embedUrl: string;
  faceCount: number;
  vertexCount: number;
  animationCount: number;
  isDownloadable: boolean;
  thumbnails: { images: SketchfabThumbnail[] };
  user: SketchfabUser;
  license: SketchfabLicense | null;
  categories: SketchfabCategory[];
  tags: Array<{ name: string; slug: string }>;
  publishedAt: string;
}

export interface SketchfabSearchResult {
  results: SketchfabModel[];
  next: string | null;
  previous: string | null;
}

export interface SketchfabDownload {
  glb?: { url: string; size: number; expires: number };
  gltf?: { url: string; size: number; expires: number };
  usdz?: { url: string; size: number; expires: number };
}

export interface SketchfabSearchParams {
  keyword?: string;
  categories?: string;
  count?: number;
  cursor?: string;
}

// ─── Sectores B2B ────────────────────────────────────────────────────────────

export type ITSector = 'ecommerce' | 'turismo' | 'educacion';

export interface CategoryOption {
  slug: string;
  label: string;
}

export interface SectorMeta {
  label: string;
  description: string;
  categories: CategoryOption[];
}

export const SECTOR_META: Record<ITSector, SectorMeta> = {
  ecommerce: {
    label: 'Ecommerce',
    description:
      'Tiendas que quieren que el comprador vea el producto en su espacio antes de comprar.',
    categories: [
      { slug: 'furniture-home', label: 'Muebles y Hogar' },
      { slug: 'food-drink', label: 'Comida y Bebida' },
      { slug: 'cars-vehicles', label: 'Vehículos' },
      { slug: 'fashion-style', label: 'Moda' },
      { slug: 'electronics-gadgets', label: 'Electrónica' },
    ],
  },
  turismo: {
    label: 'Turismo',
    description:
      'Municipios y museos que ponen QRs en monumentos y sitios históricos.',
    categories: [
      { slug: 'cultural-heritage-history', label: 'Cultura e Historia' },
      { slug: 'architecture', label: 'Arquitectura' },
      { slug: 'places-travel', label: 'Lugares y Viajes' },
    ],
  },
  educacion: {
    label: 'Educación',
    description:
      'Editoriales e instituciones que enriquecen materiales pedagógicos con modelos 3D.',
    categories: [
      { slug: 'science-technology', label: 'Ciencia y Tecnología' },
      { slug: 'animals-pets', label: 'Animales' },
      { slug: 'nature-plants', label: 'Naturaleza' },
    ],
  },
};

/** Slugs de categorías de un sector como string separado por comas */
export const sectorCategories = (sector: ITSector): string => {
  return SECTOR_META[sector].categories.map((c) => c.slug).join(',');
};

/** Mejor thumbnail para un ancho objetivo */
export const getBestThumbnail = (
  model: SketchfabModel,
  targetWidth = 300
): string => {
  const images = model.thumbnails?.images ?? [];
  if (!images.length) return '';
  const sorted = [...images].sort((a, b) => a.width - b.width);
  return (
    sorted.find((img) => img.width >= targetWidth) ?? sorted[sorted.length - 1]
  ).url;
};
