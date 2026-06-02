import type { Campaign } from '../types';

export function aggregateCampaignStats(campaigns: Campaign[]) {
  return {
    views: campaigns.reduce((a, c) => a + (c.views ?? 0), 0),
    ar: campaigns.reduce((a, c) => a + (c.arActivations ?? 0), 0),
    cta: campaigns.reduce((a, c) => a + (c.ctaClicks ?? 0), 0),
  };
}
