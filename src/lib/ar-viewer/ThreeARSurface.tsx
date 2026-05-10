import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ARButton } from 'three/addons/webxr/ARButton.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'
import type { ThreeARSurfaceProps, ARTrackingStatus } from './types'

// ---- Helpers puros -----------------------------------------------------------

const parseScale = (scaleText?: string): [number, number, number] => {
  const parts = `${scaleText ?? '1 1 1'}`
    .trim()
    .split(/\s+/)
    .map((v) => Number(v))
  if (parts.length !== 3 || parts.some((v) => Number.isNaN(v))) return [1, 1, 1]
  return parts as [number, number, number]
}

/** Centra el modelo en X/Z y lo pisa en Y=0 para que quede apoyado en el suelo */
const normalizeModelForPlacement = (model: THREE.Object3D): void => {
  const box = new THREE.Box3().setFromObject(model)
  if (box.isEmpty()) return
  const center = new THREE.Vector3()
  box.getCenter(center)
  model.position.x -= center.x
  model.position.z -= center.z
  model.position.y -= box.min.y
}

/** Modelo de fallback cuando el GLB no carga */
const createFallbackModel = (): THREE.Group => {
  const group = new THREE.Group()
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: 0x1f2a44, metalness: 0.2, roughness: 0.7 }),
  )
  base.position.y = 0.01
  group.add(base)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.14, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x7b8aa6, metalness: 0.1, roughness: 0.65 }),
  )
  body.position.y = 0.1
  group.add(body)
  return group
}

/** Prepara materiales para renderizado WebXR */
const prepareModelForRender = (model: THREE.Object3D): number => {
  let meshCount = 0
  model.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return
    meshCount += 1
    ;(node as THREE.Mesh).frustumCulled = false
    const mesh = node as THREE.Mesh
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((material) => {
      if (!material) return
      const mat = material as THREE.MeshStandardMaterial
      mat.side = THREE.DoubleSide
      if (mat.opacity === 0) mat.opacity = 1
      mat.transparent = mat.opacity < 1
      mat.needsUpdate = true
    })
  })
  return meshCount
}

/** Libera memoria de geometrías, materiales y texturas */
const disposeObject = (object: THREE.Object3D | null): void => {
  if (!object) return
  object.traverse((node) => {
    const mesh = node as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => {
        if (!material) return
        const mat = material as THREE.MeshStandardMaterial & Record<string, THREE.Texture | null>
        const slots = [
          'map', 'lightMap', 'bumpMap', 'normalMap', 'displacementMap',
          'roughnessMap', 'metalnessMap', 'alphaMap', 'envMap', 'aoMap',
          'emissiveMap', 'specularMap', 'gradientMap',
        ] as const
        slots.forEach((s) => { const t = mat[s]; if (t) t.dispose() })
        mat.dispose()
      })
    }
  })
}

// ---- Helpers de gestos -------------------------------------------------------

const touchDist = (t1: Touch, t2: Touch): number => {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const touchAngle = (t1: Touch, t2: Touch): number => {
  return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX)
}

// ---- Componente -------------------------------------------------------------

export const ThreeARSurface = ({
  modelUrl,
  modelScale = '1 1 1',
  modelLabel = 'modelo-3d',
  showLabel = true,
  targetHeight = 0.4,
  onStatusChange,
}: ThreeARSurfaceProps) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const [bootStatus, setBootStatus] = useState('inicializando')

  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => { onStatusChangeRef.current = onStatusChange }, [onStatusChange])

  // Inyectar label del modelo en el host
  useEffect(() => {
    const host = hostRef.current
    if (!host || !showLabel) return
    const label = document.createElement('div')
    label.className = 'three-ar-label'
    label.textContent = modelLabel
    host.appendChild(label)
    return () => { if (label.parentElement === host) host.removeChild(label) }
  }, [showLabel, modelLabel])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    let renderer: THREE.WebGLRenderer | null = null
    let scene: THREE.Scene | null = null
    let camera: THREE.PerspectiveCamera | null = null
    let controller: THREE.XRTargetRaySpace | null = null
    let reticle: THREE.Mesh | null = null
    let hitTestSource: XRHitTestSource | null = null
    let hitTestSourceRequested = false
    let modelTemplate: THREE.Object3D | null = null
    let placedModel: THREE.Object3D | null = null
    let destroyed = false
    let xrSession: XRSession | null = null
    let onSessionEnd: (() => void) | null = null
    let inXRSession = false
    const lastStatusRef = { value: '' }

    // ---- Estado de gestos ---------------------------------------------------
    // Enfoque "from-start": se guarda el estado al inicio del gesto y se aplica
    // un ratio desde ahí. Evita acumulación de errores de punto flotante.
    const g = {
      isDragging: false,
      startX: 0,
      startY: 0,
      hasMoved: false,           // true cuando el dedo se movió > DRAG_THRESHOLD px
      startPinchDist: 0,
      startScale: new THREE.Vector3(1, 1, 1),
      startAngle: 0,
      startRotY: 0,
    }
    const DRAG_THRESHOLD = 10   // px — por debajo de esto es tap, no drag

    // ---- Setup de escena ----------------------------------------------------
    const emitStatus = (s: string) => {
      if (lastStatusRef.value === s) return
      lastStatusRef.value = s
      setBootStatus(s)
      onStatusChangeRef.current?.(s as ARTrackingStatus)
    }

    emitStatus('cargando-escena')

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(70, host.clientWidth / host.clientHeight, 0.01, 30)

    // El canvas ocupa el contenedor — Three.js lee las dimensiones reales
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.xr.enabled = true
    host.appendChild(renderer.domElement)

    scene.add(Object.assign(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2), { position: new THREE.Vector3(0, 1, 0) }))
    scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.7), { position: new THREE.Vector3(0.2, 1, 0.1) }))

    // Reticle: anillo verde que indica dónde se puede colocar el modelo
    reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.12, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x9bf00b }),
    )
    reticle.matrixAutoUpdate = false
    reticle.visible = false
    scene.add(reticle)

    // ---- Carga del modelo ---------------------------------------------------
    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf: GLTF) => {
        if (destroyed) { disposeObject(gltf.scene); return }
        modelTemplate = gltf.scene
        const [sx, sy, sz] = parseScale(modelScale)
        modelTemplate.scale.set(sx, sy, sz)
        if (prepareModelForRender(modelTemplate) === 0) modelTemplate = createFallbackModel()
        normalizeModelForPlacement(modelTemplate)
        emitStatus('modelo-cargado-listo-para-ar')
        if (!inXRSession && renderer) renderer.render(scene!, camera!)
      },
      undefined,
      () => {
        modelTemplate = createFallbackModel()
        normalizeModelForPlacement(modelTemplate)
        emitStatus('error-carga-modelo')
        if (!inXRSession && renderer) renderer.render(scene!, camera!)
      },
    )

    // ---- Colocar modelo (tap / primer placement) ----------------------------
    const placeModel = () => {
      if (!modelTemplate || !reticle?.visible) return
      if (placedModel) { scene!.remove(placedModel); disposeObject(placedModel) }

      placedModel = (modelTemplate as THREE.Group).clone(true)
      placedModel.position.setFromMatrixPosition(reticle!.matrix)
      placedModel.position.y += 0.02
      placedModel.rotation.set(0, 0, 0)

      // Escalar al targetHeight
      const box = new THREE.Box3().setFromObject(placedModel)
      const size = new THREE.Vector3()
      box.getSize(size)
      if (Number.isFinite(size.y) && size.y > 0.001) {
        const factor = THREE.MathUtils.clamp(targetHeight / size.y, 0.1, 10)
        placedModel.scale.multiplyScalar(factor)
      }

      scene!.add(placedModel)
      emitStatus(`modelo-colocado: ${modelLabel}`)
    }

    // ---- Controller tap → place ---------------------------------------------
    controller = renderer.xr.getController(0)
    controller.addEventListener('select', () => {
      if (!modelTemplate) { emitStatus('esperando-carga-modelo'); return }
      if (!reticle?.visible) { emitStatus('sin-superficie-detectada'); return }
      if (g.hasMoved) return   // era drag, no tap
      placeModel()
    })
    scene.add(controller)

    // ---- Gestos táctiles ---------------------------------------------------
    const canvas = renderer.domElement

    const onTouchStart = (e: TouchEvent) => {
      g.hasMoved = false
      if (e.touches.length === 1) {
        g.isDragging = true
        g.startX = e.touches[0].clientX
        g.startY = e.touches[0].clientY
      } else if (e.touches.length >= 2 && placedModel) {
        g.isDragging = false
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        g.startPinchDist = touchDist(t1, t2)
        g.startScale.copy(placedModel.scale)
        g.startAngle = touchAngle(t1, t2)
        g.startRotY  = placedModel.rotation.y
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!inXRSession) return
      e.preventDefault()
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - g.startX
        const dy = e.touches[0].clientY - g.startY
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          g.hasMoved  = true
          g.isDragging = true
          // La posición se actualiza en el animation loop via el reticle
        }
      } else if (e.touches.length >= 2 && placedModel) {
        g.isDragging = false
        g.hasMoved   = true
        const t1 = e.touches[0]
        const t2 = e.touches[1]

        // Pinch → escala desde el inicio (ratio respecto al estado del gesto)
        if (g.startPinchDist > 0) {
          const ratio = THREE.MathUtils.clamp(
            touchDist(t1, t2) / g.startPinchDist,
            0.1, 10,
          )
          placedModel.scale.copy(g.startScale).multiplyScalar(ratio)
        }

        // Rotación → delta de ángulo desde el inicio
        placedModel.rotation.y = g.startRotY + (touchAngle(t1, t2) - g.startAngle)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        g.isDragging = false
      } else if (e.touches.length === 1 && placedModel) {
        // Transición de 2 dedos → 1: re-anclar estado de drag
        g.isDragging = true
        g.hasMoved   = false
        g.startX = e.touches[0].clientX
        g.startY = e.touches[0].clientY
      }
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false })

    // ---- Botón AR y resize --------------------------------------------------
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: host },
    })
    arButton.className = 'btn btn-primary three-ar-launch'
    arButton.textContent = 'Iniciar AR precisa'
    host.appendChild(arButton)

    // Resize: Three.js lee dimensiones reales del contenedor, no vh hardcodeado
    const onWindowResize = () => {
      if (!host || !renderer || !camera) return
      camera.aspect = host.clientWidth / host.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(host.clientWidth, host.clientHeight)
      if (!inXRSession) renderer.render(scene!, camera!)
    }
    window.addEventListener('resize', onWindowResize)

    // ---- Animation loop (WebXR + hit-testing) --------------------------------
    renderer.setAnimationLoop((_: number | null, frame?: XRFrame) => {
      if (frame) {
        inXRSession = true
        const session = renderer?.xr.getSession()
        if (!session) return

        if (!hitTestSourceRequested) {
          xrSession = session
          onSessionEnd = () => {
            hitTestSourceRequested = false
            hitTestSource = null
            reticle!.visible = false
            inXRSession = false
            xrSession = null
            onSessionEnd = null
            g.isDragging = false
            emitStatus('sesion-ar-finalizada')
          }
          session.addEventListener('end', onSessionEnd)

          const s = session
          s.requestReferenceSpace('viewer')
            .then((rs: XRReferenceSpace) => {
              void s.requestHitTestSource?.({ space: rs })
                ?.then((src: XRHitTestSource) => { hitTestSource = src })
                ?.catch((err: unknown) => {
                  console.warn('[ThreeARSurface] requestHitTestSource failed:', err)
                  emitStatus('error-hit-test-source')
                })
            })
            .catch((err: unknown) => {
              console.warn('[ThreeARSurface] requestReferenceSpace failed:', err)
              emitStatus('error-reference-space')
            })

          hitTestSourceRequested = true
          emitStatus('buscando-superficie')
        }

        if (hitTestSource) {
          const refSpace = renderer?.xr.getReferenceSpace()
          if (!refSpace) return
          const hits = frame.getHitTestResults(hitTestSource)

          if (hits.length > 0) {
            const pose = hits[0]!.getPose(refSpace)
            if (pose) {
              reticle!.visible = true
              reticle!.matrix.fromArray(pose.transform.matrix)

              // Drag: mover modelo colocado siguiendo el reticle
              if (g.isDragging && g.hasMoved && placedModel) {
                placedModel.position.setFromMatrixPosition(reticle!.matrix)
                placedModel.position.y += 0.02
                // scale y rotation.y se preservan de los gestos
              }

              emitStatus(g.isDragging && g.hasMoved ? `modelo-colocado: ${modelLabel}` : 'superficie-detectada')
            }
          } else {
            reticle!.visible = false
            emitStatus('buscando-superficie')
          }
        }
      }

      if (inXRSession) renderer!.render(scene!, camera!)
    })

    // ---- Cleanup ------------------------------------------------------------
    return () => {
      destroyed = true
      window.removeEventListener('resize', onWindowResize)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
      canvas.removeEventListener('touchend',   onTouchEnd)

      if (xrSession && onSessionEnd) xrSession.removeEventListener('end', onSessionEnd)

      if (renderer) {
        renderer.setAnimationLoop(null)
        if (placedModel)   { scene!.remove(placedModel); disposeObject(placedModel) }
        if (modelTemplate) disposeObject(modelTemplate)
        if (reticle)       disposeObject(reticle)
        scene!.clear()
        renderer.dispose()
        if (renderer.domElement?.parentElement === host) host.removeChild(renderer.domElement)
      }
      if (arButton?.parentElement === host) host.removeChild(arButton)
    }
  }, [modelLabel, modelScale, modelUrl, targetHeight])

  // Mapeo de estados internos a texto legible
  const statusLabel = (() => {
    if (bootStatus.startsWith('modelo-colocado')) return 'Modelo colocado ✓'
    const labels: Record<string, string> = {
      'inicializando':                'Iniciando...',
      'cargando-escena':              'Cargando...',
      'modelo-cargado-listo-para-ar': 'Tocá la superficie para colocar el modelo',
      'buscando-superficie':          'Apuntá al suelo o una mesa',
      'superficie-detectada':         'Superficie detectada — tocá para colocar',
      'sesion-ar-finalizada':         'Sesión finalizada',
      'error-carga-modelo':           'Error al cargar el modelo',
      'error-hit-test-source':        'Error al iniciar AR',
      'error-reference-space':        'Error al iniciar AR',
      'esperando-carga-modelo':       'Cargando modelo...',
      'sin-superficie-detectada':     'No se detectó superficie',
    }
    return labels[bootStatus] ?? bootStatus
  })()

  return (
    <div className="three-ar-shell">
      <div ref={hostRef} className="three-ar-host" />
      <p className="three-ar-status">
        <strong>{statusLabel}</strong>
      </p>
    </div>
  )
}
