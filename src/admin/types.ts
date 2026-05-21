import type { Subject } from './constants/subjects';

export type { Subject };

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
  subject: Subject;
  sketchfabUid: string;
  ctaUrl?: string;
  views: number;
  arActivations: number;
  ctaClicks: number;
  createdAt: string;
  qrValue: string;
  orgSlug: string;
  collectionId?: string;
}

export type UserRole = 'superadmin' | 'client';

export interface AdminUser {
  email: string;
  name: string;
  role: UserRole;
  org: string;
}
