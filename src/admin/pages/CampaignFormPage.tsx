import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { searchModels } from '@/services/sketchfab'
import type { SketchfabModel } from '@/types/sketchfab'
import { getBestThumbnail } from '@/types/sketchfab'
import { useCampaigns } from '../context/CampaignsContext'
import { SUBJECTS } from '../constants/subjects'
import { buildArQrUrl } from '../constants/urls'
import type { Campaign } from '../types'
import './CampaignFormPage.css'

interface FormFields {
  title: string
  description: string
  subject: string
  ctaUrl: string
}

interface FormErrors {
  title?: string
  description?: string
  subject?: string
  ctaUrl?: string
  model?: string
}

function UidCopyRow({ uid }: { uid: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function copyUid() {
    navigator.clipboard.writeText(uid).then(() => {
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="cfp-uid-row">
      <code className="cfp-uid">{uid}</code>
      <button type="button" className="cfp-btn cfp-btn-copy" onClick={copyUid}>
        {copied ? '¡Copiado!' : 'Copiar UID'}
      </button>
    </div>
  )
}

export function CampaignFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editCampaign = (location.state as { edit?: Campaign } | null)?.edit
  const { addCampaign, updateCampaign } = useCampaigns()

  const [fields, setFields] = useState<FormFields>({
    title: editCampaign?.title ?? '',
    description: editCampaign?.description ?? '',
    subject: editCampaign?.subject ?? '',
    ctaUrl: editCampaign?.ctaUrl ?? 'https://santillana.com.ar/libro/',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SketchfabModel[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<SketchfabModel | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const selectedUid = selectedModel?.uid ?? editCampaign?.sketchfabUid ?? null

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const keyword = searchQuery.trim()
    if (!keyword) return
    setSearching(true)
    setSearchError(null)
    setSearchResults([])
    try {
      const result = await searchModels({
        keyword,
        count: 12,
        categories: 'science-technology,animals-pets,nature-plants,cultural-heritage-history',
      })
      setSearchResults(result.results)
      if (result.results.length === 0) setSearchError('No se encontraron modelos para esa búsqueda.')
    } catch {
      setSearchError('Error al buscar modelos. Verificá tu conexión o la API key de Sketchfab.')
    } finally {
      setSearching(false)
    }
  }

  function handleSelectModel(model: SketchfabModel) {
    setSelectedModel(model)
    if (errors.model) setErrors((prev) => ({ ...prev, model: undefined }))
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!fields.title.trim()) newErrors.title = 'El título es obligatorio.'
    if (!fields.description.trim()) newErrors.description = 'La descripción es obligatoria.'
    if (!fields.subject) newErrors.subject = 'Seleccioná una materia.'
    if (!fields.ctaUrl.trim()) {
      newErrors.ctaUrl = 'La URL destino es obligatoria.'
    } else {
      try { new URL(fields.ctaUrl) } catch {
        newErrors.ctaUrl = 'Ingresá una URL válida (ej: https://...).'
      }
    }
    if (!selectedUid) newErrors.model = 'Seleccioná un modelo 3D de Sketchfab.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const campaign: Campaign = {
      id: editCampaign?.id ?? `camp-${Date.now()}`,
      title: fields.title,
      description: fields.description,
      subject: fields.subject as Campaign['subject'],
      sketchfabUid: selectedUid!,
      ctaUrl: fields.ctaUrl,
      views: editCampaign?.views ?? 0,
      arActivations: editCampaign?.arActivations ?? 0,
      ctaClicks: editCampaign?.ctaClicks ?? 0,
      createdAt: editCampaign?.createdAt ?? new Date().toISOString(),
      qrValue: buildArQrUrl(selectedUid!),
    }
    if (editCampaign) { updateCampaign(campaign) } else { addCampaign(campaign) }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="cfp-page">
        <div className="cfp-success-card">
          <div className="cfp-success-icon">&#10003;</div>
          <h2 className="cfp-success-title">¡Campaña creada!</h2>
          <p className="cfp-success-msg">Tu QR ya está listo para usar en tus materiales.</p>
          <div className="cfp-success-actions">
            <button
              className="cfp-btn cfp-btn-primary"
              onClick={() => navigate(`/admin/campanas/${editCampaign?.id ?? 'nueva'}/qr`, { state: { uid: selectedUid } })}
            >
              Ver QR generado
            </button>
            <button className="cfp-btn cfp-btn-secondary" onClick={() => navigate('/admin/dashboard')}>
              Volver al dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const previewThumb = selectedModel ? getBestThumbnail(selectedModel, 400) : null

  return (
    <div className="cfp-page">
      <div className="cfp-header">
        <div className="cfp-header-text">
          <h1>{editCampaign ? 'Editar campaña' : 'Nueva campaña'}</h1>
          <p>Completá los datos y seleccioná un modelo 3D para generar el QR.</p>
        </div>
      </div>

      <div className="cfp-layout">
        <form className="cfp-form" onSubmit={handleSubmit} noValidate>
          <div className={`cfp-field ${errors.title ? 'cfp-field--error' : ''}`}>
            <label htmlFor="cfp-title">Título de campaña</label>
            <input
              id="cfp-title" name="title" type="text"
              placeholder="ej: Geometría 5° grado — Poliedros"
              value={fields.title} onChange={handleFieldChange}
            />
            {errors.title && <span className="cfp-error-msg">{errors.title}</span>}
          </div>

          <div className={`cfp-field ${errors.description ? 'cfp-field--error' : ''}`}>
            <label htmlFor="cfp-description">Descripción</label>
            <textarea
              id="cfp-description" name="description" rows={3}
              placeholder="ej: Escaneá el QR y explorá figuras 3D en tu living"
              value={fields.description} onChange={handleFieldChange}
            />
            {errors.description && <span className="cfp-error-msg">{errors.description}</span>}
          </div>

          <div className={`cfp-field ${errors.subject ? 'cfp-field--error' : ''}`}>
            <label htmlFor="cfp-subject">Materia</label>
            <select id="cfp-subject" name="subject" value={fields.subject} onChange={handleFieldChange}>
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value} disabled={s.value === ''}>{s.label}</option>
              ))}
            </select>
            {errors.subject && <span className="cfp-error-msg">{errors.subject}</span>}
          </div>

          <div className={`cfp-field ${errors.ctaUrl ? 'cfp-field--error' : ''}`}>
            <label htmlFor="cfp-ctaUrl">URL destino / CTA</label>
            <input
              id="cfp-ctaUrl" name="ctaUrl" type="url"
              placeholder="https://santillana.com.ar/libro/matematica-5"
              value={fields.ctaUrl} onChange={handleFieldChange}
            />
            {errors.ctaUrl && <span className="cfp-error-msg">{errors.ctaUrl}</span>}
          </div>

          <div className={`cfp-field ${errors.model ? 'cfp-field--error' : ''}`}>
            <label>Modelo 3D — buscar en Sketchfab</label>
            <div className="cfp-search-row">
              <input
                type="text"
                placeholder="ej: pyramid, solar system, cell..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(e as unknown as React.FormEvent) } }}
              />
              <button type="button" className="cfp-btn cfp-btn-search" onClick={handleSearch} disabled={searching}>
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {errors.model && <span className="cfp-error-msg">{errors.model}</span>}
            {searchError && <p className="cfp-search-error">{searchError}</p>}

            {searchResults.length > 0 && (
              <div className="cfp-model-grid">
                {searchResults.map((model) => {
                  const thumb = getBestThumbnail(model, 200)
                  const isSelected = selectedModel?.uid === model.uid
                  return (
                    <button
                      key={model.uid} type="button"
                      className={`cfp-model-card ${isSelected ? 'cfp-model-card--selected' : ''}`}
                      onClick={() => handleSelectModel(model)} title={model.name}
                    >
                      {thumb
                        ? <img src={thumb} alt={model.name} className="cfp-model-thumb" />
                        : <div className="cfp-model-thumb cfp-model-thumb--placeholder">3D</div>
                      }
                      <span className="cfp-model-name">{model.name}</span>
                      {isSelected && <span className="cfp-model-check">&#10003;</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="cfp-form-footer">
            <button type="button" className="cfp-btn cfp-btn-secondary" onClick={() => navigate('/admin/dashboard')}>
              Cancelar
            </button>
            <button type="submit" className="cfp-btn cfp-btn-primary">Guardar campaña</button>
          </div>
        </form>

        <aside className="cfp-preview">
          <div className="cfp-preview-card">
            <p className="cfp-preview-label">Vista previa del modelo</p>
            {selectedModel ? (
              <>
                {previewThumb && <img src={previewThumb} alt={selectedModel.name} className="cfp-preview-img" />}
                <div className="cfp-preview-info">
                  <p className="cfp-preview-model-name">{selectedModel.name}</p>
                  <p className="cfp-preview-author">
                    por{' '}
                    <a href={selectedModel.user.profileUrl} target="_blank" rel="noopener noreferrer">
                      {selectedModel.user.displayName}
                    </a>
                  </p>
                  {selectedModel.license && (
                    <span className="cfp-preview-license">{selectedModel.license.label}</span>
                  )}
                  <UidCopyRow uid={selectedModel.uid} />
                </div>
              </>
            ) : editCampaign ? (
              <div className="cfp-preview-empty">
                <p className="cfp-preview-edit-label">Modelo actual</p>
                <UidCopyRow uid={editCampaign.sketchfabUid} />
                <p className="cfp-preview-edit-hint">Buscá un modelo nuevo para reemplazarlo</p>
              </div>
            ) : (
              <div className="cfp-preview-empty">
                <span className="cfp-preview-empty-icon">&#128247;</span>
                <p>Buscá y seleccioná un modelo 3D para verlo aquí.</p>
              </div>
            )}
          </div>

          {fields.title && (
            <div className="cfp-preview-card cfp-preview-summary">
              <p className="cfp-preview-label">Resumen de campaña</p>
              <p className="cfp-preview-summary-title">{fields.title}</p>
              {fields.subject && (
                <span className={`subject-badge badge-${fields.subject}`}>
                  {SUBJECTS.find((s) => s.value === fields.subject)?.label}
                </span>
              )}
              {fields.description && (
                <p className="cfp-preview-summary-desc">{fields.description}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
