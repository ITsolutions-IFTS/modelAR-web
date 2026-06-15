import { describe, it, expect } from 'vitest';
import { aggregateCampaignStats } from '@/admin/utils/campaignStats';
import type { Campaign } from '@/admin/types';

const base: Campaign = {
  id: '1',
  title: 'Test',
  description: '',
  sector: 'educacion',
  status: 'active',
  sketchfabUid: 'uid1',
  qrValue: 'http://localhost/#/ar/uid1',
  createdAt: '2026-01-01',
  orgSlug: 'santillana',
};

describe('aggregateCampaignStats', () => {
  it('suma views, ar y cta de múltiples campañas', () => {
    const campaigns: Campaign[] = [
      { ...base, views: 10, arActivations: 3, ctaClicks: 1 },
      { ...base, id: '2', views: 5, arActivations: 2, ctaClicks: 0 },
    ];
    expect(aggregateCampaignStats(campaigns)).toEqual({
      views: 15,
      ar: 5,
      cta: 1,
    });
  });

  it('trata campos undefined como 0', () => {
    const campaigns: Campaign[] = [base, { ...base, id: '2' }];
    expect(aggregateCampaignStats(campaigns)).toEqual({
      views: 0,
      ar: 0,
      cta: 0,
    });
  });

  it('retorna ceros para lista vacía', () => {
    expect(aggregateCampaignStats([])).toEqual({ views: 0, ar: 0, cta: 0 });
  });
});
