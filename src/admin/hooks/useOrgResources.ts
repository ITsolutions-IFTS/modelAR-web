import { useMemo } from 'react';
import { useActiveOrg } from '../context/ActiveOrgContext';
import { useCampaigns } from '../context/CampaignsContext';
import { useCollections } from '../context/CollectionsContext';
import { ORGS } from '../constants/orgs';

export function useOrgResources() {
  const { activeOrg } = useActiveOrg();
  const { campaigns } = useCampaigns();
  const { collections } = useCollections();

  const org = useMemo(
    () => ORGS.find((o) => o.slug === activeOrg?.slug),
    [activeOrg]
  );

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
