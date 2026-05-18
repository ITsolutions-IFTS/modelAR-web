export type Subject = 'matematica' | 'ciencias' | 'historia' | 'lengua'

export const SUBJECT_LABELS: Record<Subject, string> = {
  matematica: 'Matemática',
  ciencias: 'Ciencias Naturales',
  historia: 'Historia',
  lengua: 'Lengua',
}

export const SUBJECTS: { value: Subject | ''; label: string }[] = [
  { value: '', label: 'Seleccioná una materia' },
  { value: 'matematica', label: 'Matemática' },
  { value: 'ciencias', label: 'Ciencias Naturales' },
  { value: 'historia', label: 'Historia' },
  { value: 'lengua', label: 'Lengua' },
]
