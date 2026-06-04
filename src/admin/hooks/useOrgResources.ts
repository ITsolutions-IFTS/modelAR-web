import { useMemo } from 'react';
import { useActiveOrg } from '../context/ActiveOrgContext';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const { organizations } = useOrganizations();
  const { campaigns } = useCampaigns();
  const { collections } = useCollections();

  const isSuperadmin = user?.role === 'superadmin';

  const org = useMemo(() => {
    const match = organizations.find((o) => o.slug === activeOrg?.slug);
    return match ? enrichOrg(match) : undefined;
  }, [organizations, activeOrg]);

  // Superadmin ve todo sin filtrar por org — es admin global.
  // Cliente ve solo los recursos de su propia org.
  const orgCampaigns = useMemo(
    () =>
      isSuperadmin
        ? campaigns
        : campaigns.filter((c) => c.orgSlug === activeOrg?.slug),
    [campaigns, activeOrg, isSuperadmin]
  );

  const orgCollections = useMemo(
    () =>
      isSuperadmin
        ? collections
        : collections.filter((c) => c.orgSlug === activeOrg?.slug),
    [collections, activeOrg, isSuperadmin]
  );

  return { org, orgCampaigns, orgCollections, activeOrg };
}
