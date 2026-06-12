import { useMemo } from 'react';
import { useOrganizations } from '../context/OrganizationsContext';
import type { Campaign } from '../types';

export type OrganizationOption = {
  slug: string;
  name: string;
  label: string;
};

export function useOrganizationOptions(campaigns: Campaign[] = []) {
  const { organizations } = useOrganizations();

  return useMemo(() => {
    const sortedOrganizations = [...organizations].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const baseOptions: OrganizationOption[] = sortedOrganizations.map(
      (organization) => ({
        slug: organization.slug,
        name: organization.name,
        label: organization.name,
      })
    );

    const knownSlugs = new Set(
      baseOptions.map((organization) => organization.slug)
    );
    const fallbackOptions: OrganizationOption[] = [
      ...new Set(campaigns.map((campaign) => campaign.orgSlug)),
    ]
      .filter((slug) => !knownSlugs.has(slug))
      .map((slug) => ({
        slug,
        name: slug,
        label: slug,
      }));

    const combinedOptions = [...baseOptions, ...fallbackOptions];
    const nameCounts = combinedOptions.reduce<Record<string, number>>(
      (acc, organization) => {
        acc[organization.name] = (acc[organization.name] ?? 0) + 1;
        return acc;
      },
      {}
    );

    return combinedOptions
      .map((organization) => ({
        ...organization,
        label:
          nameCounts[organization.name] > 1
            ? `${organization.name} (${organization.slug})`
            : organization.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [campaigns, organizations]);
}
