import type { Campaign } from '../types'
import { buildArQrUrl } from '../constants/urls'

export const mockCampaigns: Campaign[] = [
  {
    id: 'camp-001',
    title: 'Geometría en 3D - 6° Primaria',
    description:
      'Escaneá el QR en la página 42 de tu libro de Matemática para ver figuras geométricas en realidad aumentada: cubos, pirámides y esferas cobran vida.',
    subject: 'matematica',
    sketchfabUid: 'fe85107a4491481f8b176f85df856365',
    ctaUrl: 'https://santillana.com.ar/matematica-6/geometria',
    views: 1842,
    arActivations: 1124,
    ctaClicks: 287,
    createdAt: '2025-03-10T09:00:00.000Z',
    qrValue: buildArQrUrl('fe85107a4491481f8b176f85df856365'),
  },
  {
    id: 'camp-002',
    title: 'El Sistema Solar - 5° Primaria',
    description:
      'Viajá por el sistema solar desde tu aula. Apuntá la cámara al QR de la página 78 del libro de Ciencias Naturales y explorá los planetas en AR.',
    subject: 'ciencias',
    sketchfabUid: '0bebd0fe3124417dba7e7a4b62bbc8a3',
    ctaUrl: 'https://santillana.com.ar/ciencias-5/sistema-solar',
    views: 2015,
    arActivations: 1308,
    ctaClicks: 342,
    createdAt: '2025-03-18T10:30:00.000Z',
    qrValue: buildArQrUrl('0bebd0fe3124417dba7e7a4b62bbc8a3'),
  },
  {
    id: 'camp-003',
    title: 'Pirámides de Egipto - 4° Primaria',
    description:
      'Reconstruí las pirámides de Giza en tu escritorio. Escaneá el QR en la página 115 del libro de Historia y descubrí la arquitectura del antiguo Egipto.',
    subject: 'historia',
    sketchfabUid: '01810314feca4415a33a51dd151eacb3',
    ctaUrl: 'https://santillana.com.ar/historia-4/antiguo-egipto',
    views: 934,
    arActivations: 521,
    ctaClicks: 98,
    createdAt: '2025-04-02T08:15:00.000Z',
    qrValue: buildArQrUrl('01810314feca4415a33a51dd151eacb3'),
  },
  {
    id: 'camp-004',
    title: 'La Célula Animal - 3° Secundaria',
    description:
      'Explorá la estructura de una célula animal en 3D. Escaneá el QR en la página 33 de Biología y accedé a cada orgánulo con su función detallada.',
    subject: 'ciencias',
    sketchfabUid: '78b4b0b2c690485c9ea776bc2daa0569',
    ctaUrl: 'https://santillana.com.ar/biologia-3/celula-animal',
    views: 673,
    arActivations: 389,
    ctaClicks: 72,
    createdAt: '2025-04-20T11:00:00.000Z',
    qrValue: buildArQrUrl('78b4b0b2c690485c9ea776bc2daa0569'),
  },
]
