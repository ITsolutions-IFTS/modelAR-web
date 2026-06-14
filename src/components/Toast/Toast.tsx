import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import './Toast.css';

export type ToastVariant = 'success' | 'error';

export interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  // Expone la función para ser usada desde cualquier parte
  const showToast = useCallback((message: string, variant: ToastVariant) => {
    // Usar Date.now() asegura un ID único que fuerza el re-render y reinicia la animación
    setToast({ id: Date.now(), message, variant });
  }, []);

  // Maneja el ciclo de vida: se auto-descarta a los 3 segundos
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    // Limpieza crítica: si entra un toast nuevo antes de los 3s, cancela el borrado del anterior
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast--${toast.variant}`} key={toast.id}>
            {toast.variant === 'success' ? (
              <CheckCircleIcon
                className="toast-icon--success"
                weight="fill"
                size={24}
              />
            ) : (
              <WarningCircleIcon
                className="toast-icon--error"
                weight="fill"
                size={24}
              />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Hook personalizado para consumir el contexto
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue['showToast'] {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  return ctx.showToast;
}
