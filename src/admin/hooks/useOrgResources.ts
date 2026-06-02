import { useMemo } from 'react';
import { useActiveOrg } from '../context/ActiveOrgContext';
import { useCampaigns } from '../context/CampaignsContext';
import { useCollections } from '../context/CollectionsContext';
import { useOrganizations } from '../context/OrganizationsContext';
import { SECTOR_UI, type SectorUi } from '../constants/sectorUi';
import type { Organization } from '../types';

/**
 * Tipo combinado que los consumidores de la UI usan: la organization tal
 * como viene del API + las propiedades de presentacion derivadas del
 * `sector` (color, labels de colecciones, label del CTA).
 *
 * Reemplaza al antiguo `Org` hardcodeado en `constants/orgs.ts`.
 */
export type EnrichedOrg = Organization & SectorUi;

export function enrichOrg(org: Organization): EnrichedOrg {
  return { ...org, ...SECTOR_UI[org.sector] };
}

export function useOrgResources() {
  const { activeOrg } = useActiveOrg();
  const { organizations } = useOrganizations();
  const { campaigns } = useCampaigns();
  const { collections } = useCollections();

  const org = useMemo(() => {
    const match = organizations.find((o) => o.slug === activeOrg?.slug);
    return match ? enrichOrg(match) : undefined;
  }, [organizations, activeOrg]);

  const orgCampaigns = useMemo(
    () => campaigns.filter((c) => c.orgSlug === activeOrg?.slug),
    [campaigns, activeOrg]
  );

  const orgCollections = useMemo(
    () => collections.filter((c) => c.orgSlug === activeOrg?.slug),
    [collections, activeOrg]
  );

  return { org, orgCampaigns, orgCollections, activeOrg };
}
