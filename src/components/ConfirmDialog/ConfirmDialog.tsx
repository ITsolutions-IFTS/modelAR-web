import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import './ConfirmDialog.css';

export type ConfirmVariant = 'danger' | 'neutral';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

interface ConfirmContextValue {
  /**
   * Abre el dialogo y resuelve true si el usuario confirma, false si cancela
   * (incluyendo cierre por backdrop click o tecla Escape).
   */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

interface PendingConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      if (pending) {
        pending.resolve(result);
        setPending(null);
      }
    },
    [pending]
  );

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending && <ConfirmDialog pending={pending} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  pending,
  onClose,
}: {
  pending: PendingConfirm;
  onClose: (result: boolean) => void;
}) {
  const variant: ConfirmVariant = pending.variant ?? 'neutral';
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Auto-focus en el boton de confirmacion al abrir.
  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  // Escape cierra como cancelar.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose(false);
  }

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onOverlayClick}
    >
      <div className={`confirm-card confirm-card--${variant}`}>
        <h2 id="confirm-title" className="confirm-title">
          {pending.title}
        </h2>
        <p className="confirm-message">{pending.message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn--cancel"
            onClick={() => onClose(false)}
          >
            {pending.cancelLabel ?? 'Cancelar'}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`confirm-btn confirm-btn--confirm-${variant}`}
            onClick={() => onClose(true)}
          >
            {pending.confirmLabel ?? 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm(): ConfirmContextValue['confirm'] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx.confirm;
}
