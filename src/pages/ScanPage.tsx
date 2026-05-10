import { useNavigate } from 'react-router-dom'
import { QRScanner } from '@/lib/qr-scanner'
import { parseScanToModelId } from '@/lib/qr-scanner'

export const ScanPage = () => {
  const navigate = useNavigate()

  const handleDetected = (text: string) => {
    const id = parseScanToModelId(text)
    if (id) {
      navigate(`/ar/${id}`)
    }
  }

  const handleError = (err: Error) => {
    console.warn('[ScanPage] QR error:', err)
  }

  return (
    <main className="scan-page">
      <h1>Escanear código QR</h1>
      <p className="scan-page__hint">
        Apuntá la cámara al código QR de una experiencia AR para abrirla directamente.
      </p>
      <QRScanner onDetected={handleDetected} onError={handleError} />
    </main>
  )
}
