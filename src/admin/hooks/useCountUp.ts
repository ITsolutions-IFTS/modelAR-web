import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration: number = 800): number {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    // Si el objetivo es 0, cortamos rápido y evitamos cálculos innecesarios
    if (target === 0) {
      setCurrentValue(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Progreso lineal entre 0 y 1
      const progress = Math.min(elapsed / duration, 1);

      // Curva de aceleración (easeOutQuart) para que el número frene suavemente al final
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      setCurrentValue(target * easeProgress);

      if (progress < 1) {
        // Si no terminamos, pedimos el siguiente frame
        animationFrameId = requestAnimationFrame(step);
      } else {
        // Aseguramos que el valor final sea exactamente el target sin decimales residuales
        setCurrentValue(target);
      }
    };

    // Iniciamos el loop
    animationFrameId = requestAnimationFrame(step);

    // Función de limpieza: previene fugas de memoria si el usuario cambia
    // de página rápido o si el target cambia en medio de la animación
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return currentValue;
}
