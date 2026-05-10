import { useRef } from 'react'
import { useQRScanner } from './useQRScanner'
import './styles.css'

interface QRScannerProps {
  onDetected: (text: string) => void
  onError?: (error: Error) => void
  className?: string
}

const STATUS_LABEL: Record<string, string> = {
  idle:         'Iniciando cámara...',
  initializing: 'Abriendo cámara...',
  scanning:     'Apuntá la cámara al código QR',
  detected:     'Código detectado ✓',
  error:        'No se pudo acceder a la cámara — revisá los permisos',
}

export const QRScanner = ({ onDetected, onError, className = 'qr-scanner' }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { status } = useQRScanner(videoRef, { onResult: onDetected, onError })

  return (
    <div className={className}>
      <div className="qr-scanner__viewfinder">
        <video ref={videoRef} className="qr-scanner__video" muted playsInline />
        <div className="qr-scanner__sweep" aria-hidden="true" />
      </div>
      <p className="qr-scanner__status" role="status" aria-live="polite">
        {STATUS_LABEL[status] ?? status}
      </p>
    </div>
  )
}
