import type { Sector } from '../types';

/**
 * Mapping puramente UI: dado un `sector` del dominio, derivamos los textos
 * y la clase de color que la UI usa para presentar la organizacion. Estos
 * campos NO viven en la API (no son parte del dominio) — son decisiones
 * de presentacion que cada cliente del web aplica localmente.
 *
 * Asi mantenemos `OrganizationEntity` minima en el core y evitamos pisar
 * la base de datos con strings de UI.
 */
export interface SectorUi {
  color: string;
  collectionLabel: string;
  collectionLabelPlural: string;
  ctaLabel: string;
}

export const SECTOR_UI: Record<Sector, SectorUi> = {
  ecommerce: {
    color: 'org-ecommerce',
    collectionLabel: 'Categoría',
    collectionLabelPlural: 'Categorías',
    ctaLabel: 'CTA (ver producto)',
  },
  turismo: {
    color: 'org-turismo',
    collectionLabel: 'Destino',
    collectionLabelPlural: 'Destinos',
    ctaLabel: 'CTA (más info)',
  },
  educacion: {
    color: 'org-educacion',
    collectionLabel: 'Serie',
    collectionLabelPlural: 'Series',
    ctaLabel: 'CTA (ir al sitio)',
  },
  inmobiliario: {
    color: 'org-inmobiliario',
    collectionLabel: 'Proyecto',
    collectionLabelPlural: 'Proyectos',
    ctaLabel: 'CTA (ver unidades)',
  },
  museo: {
    color: 'org-museo',
    collectionLabel: 'Sala',
    collectionLabelPlural: 'Salas',
    ctaLabel: 'CTA (más info)',
  },
};
