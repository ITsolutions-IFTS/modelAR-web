export type Subject =
  | 'matematica'
  | 'ciencias'
  | 'historia'
  | 'lengua'
  | 'producto'
  | 'espacio';

export const SUBJECT_LABELS: Record<Subject, string> = {
  matematica: 'Matemática',
  ciencias: 'Ciencias Naturales',
  historia: 'Historia',
  lengua: 'Lengua',
  producto: 'Producto',
  espacio: 'Espacio',
};

export const SUBJECTS: { value: Subject | ''; label: string }[] = [
  { value: '', label: 'Seleccioná una categoría' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'ciencias', label: 'Ciencias Naturales' },
  { value: 'historia', label: 'Historia' },
  { value: 'lengua', label: 'Lengua' },
  { value: 'producto', label: 'Producto' },
  { value: 'espacio', label: 'Espacio' },
];
