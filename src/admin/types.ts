export type Sector =
  | 'ecommerce'
  | 'turismo'
  | 'educacion'
  | 'inmobiliario'
  | 'museo';

export const SECTOR_LABELS: Record<Sector, string> = {
  ecommerce: 'Ecommerce',
  turismo: 'Turismo',
  educacion: 'Educación',
  inmobiliario: 'Inmobiliario',
  museo: 'Museo',
};

export const SECTORS: { value: Sector | ''; label: string }[] = [
  { value: '', label: 'Seleccioná un sector' },
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'educacion', label: 'Educación' },
  { value: 'inmobiliario', label: 'Inmobiliario' },
  { value: 'museo', label: 'Museo' },
];

export interface Organization {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sector: Sector;
}

export interface Collection {
  id: string;
  orgSlug: string;
  name: string;
  description?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  sector: Sector;
  sketchfabUid: string;
  ctaUrl?: string;
  views?: number;
  arActivations?: number;
  ctaClicks?: number;
  createdAt: string;
  qrValue: string;
  orgSlug: string;
  collectionId?: string;
}

export type CreateCampaignInput = {
  title: string;
  description: string;
  sector: Sector;
  sketchfabUid: string;
  ctaUrl?: string;
  collectionId?: string;
};

export type UpdateCampaignInput = Partial<CreateCampaignInput>;

export type UserRole = 'superadmin' | 'client';

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  orgSlug: string;
}
