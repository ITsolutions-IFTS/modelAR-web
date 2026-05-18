export const formatNumber = (n: number) => n.toLocaleString('es-AR')

export const formatPercent = (numerator: number, denominator: number) =>
  denominator === 0
    ? '0 %'
    : `${((numerator / denominator) * 100).toFixed(1)} %`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
