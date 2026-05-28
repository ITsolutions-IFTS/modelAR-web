import { useEffect, useRef } from 'react';

type DynamicBarAxis = 'width' | 'height';

interface DynamicBarProps {
  className: string;
  percent: number;
  axis?: DynamicBarAxis;
}

export function DynamicBar({
  className,
  percent,
  axis = 'width',
}: DynamicBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const safePercent = Math.max(0, Math.min(percent, 100));

  useEffect(() => {
    if (!barRef.current) return;
    barRef.current.style[axis] = `${safePercent.toFixed(0)}%`;
  }, [axis, safePercent]);

  return <div ref={barRef} className={className} />;
}
