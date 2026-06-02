import type { CSSProperties } from 'react';

type DynamicBarAxis = 'width' | 'height';

interface DynamicBarProps {
  className: string;
  percent: number;
  axis?: DynamicBarAxis;
}

/**
 * Rectángulo cuyo ancho (o alto) viene de la prop `percent` y se aplica
 * via custom property CSS. La clase consumidora debe leer la var:
 *
 *   .my-bar { width: var(--bar-width, 0%); }
 *   .my-vertical-bar { height: var(--bar-height, 0%); }
 *
 * Patrón con un único token inline en lugar de mutar el DOM por `useEffect`:
 * evita el FOUC del primer render y deja todo el styling en la hoja de estilos.
 */
export function DynamicBar({
  className,
  percent,
  axis = 'width',
}: DynamicBarProps) {
  const safePercent = Math.max(0, Math.min(percent, 100));
  const style = {
    [`--bar-${axis}`]: `${safePercent.toFixed(0)}%`,
  } as CSSProperties;
  return <div className={className} style={style} />;
}
