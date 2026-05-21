export interface Org {
  slug: string;
  name: string;
  description: string;
  color: string;
  collectionLabel: string;
  collectionLabelPlural: string;
  ctaLabel: string;
}

export const ORGS: Org[] = [
  {
    slug: 'santillana',
    name: 'Santillana',
    description:
      'Editorial educativa líder en Argentina. Campañas AR para libros escolares.',
    color: 'org-santillana',
    collectionLabel: 'Serie',
    collectionLabelPlural: 'Series',
    ctaLabel: 'CTA (ir al sitio)',
  },
  {
    slug: 'vega',
    name: 'Vega Desarrollos',
    description:
      'Desarrolladora inmobiliaria. Experiencias AR para visualización de unidades y proyectos.',
    color: 'org-vega',
    collectionLabel: 'Proyecto',
    collectionLabelPlural: 'Proyectos',
    ctaLabel: 'CTA (ver unidades)',
  },
  {
    slug: 'garbarino',
    name: 'Garbarino',
    description:
      'Retail de electrónica y electrodomésticos. Experiencias AR para catálogo de productos.',
    color: 'org-garbarino',
    collectionLabel: 'Categoría',
    collectionLabelPlural: 'Categorías',
    ctaLabel: 'CTA (ver producto)',
  },
  {
    slug: 'museo-mar',
    name: 'Museo Mar',
    description:
      'Museo de Arte de Mar del Plata. Exhibiciones interactivas con modelos 3D en AR.',
    color: 'org-museo-mar',
    collectionLabel: 'Sala',
    collectionLabelPlural: 'Salas',
    ctaLabel: 'CTA (más info)',
  },
];
