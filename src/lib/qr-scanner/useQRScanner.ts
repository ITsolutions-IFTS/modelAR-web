import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'

export type QRScannerStatus =
  | 'idle'
  | 'initializing'
  | 'scanning'
  | 'detected'
  | 'error'

export interface UseQRScannerOptions {
  onResult: (text: string) => void
  onError?: (error: Error) => void
}

export interface UseQRScannerReturn {
  status: QRScannerStatus
  lastResult: string | null
  stop: () => void
}

export function useQRScanner(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { onResult, onError }: UseQRScannerOptions,
): UseQRScannerReturn {
  const [status, setStatus] = useState<QRScannerStatus>('idle')
  const [lastResult, setLastResult] = useState<string | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const onResultRef = useRef(onResult)
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  const onErrorRef = useRef(onError)
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reader = new BrowserQRCodeReader()
    let stopped = false

    setStatus('initializing')

    reader
      .decodeFromVideoDevice(undefined, video, (result, error) => {
        if (stopped) return
        if (result) {
          const text = result.getText()
          setLastResult(text)
          setStatus('detected')
          onResultRef.current(text)
        } else if (error && !(error.name === 'NotFoundException')) {
          // NotFoundException es el estado normal cuando no hay QR en frame
          console.warn('[QRScanner]', error)
        } else if (!error) {
          setStatus('scanning')
        }
      })
      .then((controls) => {
        if (stopped) { controls.stop(); return }
        controlsRef.current = controls
        setStatus('scanning')
      })
      .catch((err: Error) => {
        if (stopped) return
        setStatus('error')
        onErrorRef.current?.(err)
      })

    return () => {
      stopped = true
      controlsRef.current?.stop()
      controlsRef.current = null
      setStatus('idle')
    }
  // videoRef es estable — el effect solo se monta/desmonta con el componente
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stop() {
    controlsRef.current?.stop()
    controlsRef.current = null
    setStatus('idle')
  }

  return { status, lastResult, stop }
}
