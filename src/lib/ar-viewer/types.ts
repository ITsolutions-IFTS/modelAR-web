import type React from 'react'

export type ARPlacement = 'floor' | 'wall'

export type ARTrackingStatus =
  | 'idle' | 'initializing' | 'loading-model' | 'model-ready'
  | 'searching-surface' | 'surface-detected' | 'model-placed'
  | 'session-ended' | 'error'

export interface ARViewerProps {
  modelUrl: string
  modelScale?: string
  modelLabel?: string
  description?: string
  placement?: ARPlacement
  alt?: string
  showLabel?: boolean
  /** Alto deseado del modelo en metros al colocarlo en AR (default 0.4m) */
  targetHeight?: number
  onStatusChange?: (status: ARTrackingStatus) => void
  onModelLoad?: () => void
  style?: React.CSSProperties
  children?: React.ReactNode
}

export interface ThreeARSurfaceProps {
  modelUrl: string
  modelScale?: string
  modelLabel?: string
  showLabel?: boolean
  targetHeight?: number
  onStatusChange?: (status: ARTrackingStatus) => void
}
