import { useEffect, useState, useRef, useCallback } from 'react';
import '@google/model-viewer';
import type { ARViewerProps, ARTrackingStatus } from './types';
import { ThreeARSurface } from './ThreeARSurface';
import './styles.css';

export const ARViewer = ({
  modelUrl,
  modelScale = '1 1 1',
  modelLabel = 'modelo-3d',
  description,
  placement = 'floor',
  alt = '',
  showLabel = true,
  targetHeight = 0.4,
  onStatusChange,
  onModelLoad,
  children,
}: ARViewerProps) => {
  const [isWebXRSupported, setIsWebXRSupported] = useState(false);
  const [showPreciseAR, setShowPreciseAR] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [arSessionActive, setArSessionActive] = useState(false);
  const modelViewerRef = useRef<HTMLElement>(null);

  // Estabilizar callbacks en refs para no teardown/re-register listeners
  // cada vez que el padre pasa una nueva función inline
  const onModelLoadRef = useRef(onModelLoad);
  useEffect(() => {
    onModelLoadRef.current = onModelLoad;
  }, [onModelLoad]);
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Detectar soporte WebXR una sola vez al montar
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!navigator.xr?.isSessionSupported) return;
      try {
        const ok = await navigator.xr.isSessionSupported('immersive-ar');
        if (!cancelled) setIsWebXRSupported(ok);
      } catch {
        /* sin WebXR */
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resetear estado de carga cuando cambia el modelo
  useEffect(() => {
    setModelLoading(true);
    setShowPreciseAR(false);
  }, [modelUrl]);

  // Listeners de model-viewer
  useEffect(() => {
    const el = modelViewerRef.current;
    if (!el) return;

    const handleLoad = () => {
      setModelLoading(false);
      onModelLoadRef.current?.();
    };
    const handleTracking = (e: Event) => {
      const status =
        (e as CustomEvent<{ status?: ARTrackingStatus }>).detail?.status ??
        'idle';
      onStatusChangeRef.current?.(status);
    };
    const handleArStatus = (e: Event) => {
      const status =
        (e as CustomEvent<{ status?: string }>).detail?.status ??
        'not-presenting';
      setArSessionActive(status !== 'not-presenting');
    };

    el.addEventListener('load', handleLoad);
    el.addEventListener('ar-tracking', handleTracking);
    el.addEventListener('ar-status', handleArStatus);
    return () => {
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('ar-tracking', handleTracking);
      el.removeEventListener('ar-status', handleArStatus);
    };
  }, [modelUrl]);

  const handleTrackingChange = useCallback((status: ARTrackingStatus) => {
    onStatusChangeRef.current?.(status);
  }, []);

  return (
    <div className="ar-viewer">
      {modelLoading && (
        <div className="ar-viewer__loading">Cargando modelo 3D...</div>
      )}

      {!showPreciseAR ? (
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          alt={alt || modelLabel}
          ar
          ar-modes="scene-viewer webxr quick-look"
          ar-placement={placement}
          ar-scale="auto"
          scale={modelScale}
          camera-controls
          touch-action="pan-y"
          auto-rotate
          auto-rotate-delay="1500"
          shadow-intensity="1"
          shadow-softness="0.8"
          environment-image="neutral"
          exposure="1"
          className="ar-viewer__model"
        >
          <button slot="ar-button" className="btn btn-primary ar-btn">
            Ver en tu espacio
          </button>
          {showLabel && arSessionActive && (
            <div className="ar-viewer__scene-label">{modelLabel}</div>
          )}
          {children}
        </model-viewer>
      ) : (
        <ThreeARSurface
          modelUrl={modelUrl}
          modelScale={modelScale}
          modelLabel={modelLabel}
          showLabel={showLabel}
          targetHeight={targetHeight}
          onStatusChange={handleTrackingChange}
        />
      )}

      {showLabel && description && (
        <div className="ar-viewer__description">{description}</div>
      )}

      {isWebXRSupported && (
        <button
          className="ar-viewer__toggle"
          onClick={() => setShowPreciseAR((prev) => !prev)}
        >
          {showPreciseAR
            ? 'Volver a vista previa 3D'
            : 'Usar AR precisa (Three.js)'}
        </button>
      )}
    </div>
  );
};
