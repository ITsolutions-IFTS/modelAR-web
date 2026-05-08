// Augment JSX IntrinsicElements to include <model-viewer>
import type React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string
        alt?: string
        ar?: boolean | ''
        'ar-modes'?: string
        'ar-placement'?: 'floor' | 'wall'
        'ar-scale'?: 'auto' | 'fixed'
        scale?: string
        'camera-controls'?: boolean | ''
        'touch-action'?: string
        'auto-rotate'?: boolean | ''
        'auto-rotate-delay'?: string | number
        'shadow-intensity'?: string | number
        'shadow-softness'?: string | number
        'environment-image'?: string
        exposure?: string | number
        loading?: 'auto' | 'lazy' | 'eager'
        reveal?: 'auto' | 'interaction' | 'manual'
        poster?: string
        style?: React.CSSProperties
        class?: string
        ref?: React.Ref<HTMLElement>
        onError?: React.ReactEventHandler<HTMLElement>
        onLoad?: React.ReactEventHandler<HTMLElement>
      }
    }
  }
}

export {}
