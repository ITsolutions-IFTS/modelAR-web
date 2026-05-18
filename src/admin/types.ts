import type { Subject } from './constants/subjects'

export type { Subject }

export interface Campaign {
  id: string
  title: string
  description: string
  subject: Subject
  sketchfabUid: string
  ctaUrl: string
  views: number
  arActivations: number
  ctaClicks: number
  createdAt: string
  qrValue: string
}

export interface AdminUser {
  email: string
  name: string
}
