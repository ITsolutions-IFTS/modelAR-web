import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircleIcon,
  CameraIcon,
  CopyIcon,
  CheckIcon,
} from '@phosphor-icons/react';
import { searchModels } from '@/services/sketchfab';
import type { SketchfabModel } from '@/types/sketchfab';
import { getBestThumbnail } from '@/types/sketchfab';
import { useCampaigns } from '../context/CampaignsContext';
import { useOrganizationOptions } from '../hooks/useOrganizationOptions';
import { useOrgResources } from '../hooks/useOrgResources';
import { SECTOR_LABELS } from '../types';
import type { Campaign, CreateCampaignInput, Sector } from '../types';
import './CampaignFormPage.css';

interface FormFields {
  title: string;
  description: string;
  sector: string;
  orgSlug: string;
  collectionId: string;
  newCollectionName: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  sector?: string;
  orgSlug?: string;
  model?: string;
}

function UidCopyRow({ uid }: { uid: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  function copyUid() {
    navigator.clipboard.writeText(uid).then(() => {
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="cfp-uid-row">
      <code className="cfp-uid">{uid}</code>
      <button type="button" className="cfp-btn cfp-btn-copy" onClick={copyUid}>
        {copied ? (
          <>
            <CheckIcon weight="bold" size={13} /> Copiado
          </>
        ) : (
          <>
            <CopyIcon weight="regular" size={13} /> Copiar UID
          </>
        )}
      </button>
    </div>
  );
}

export function CampaignFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editCampaign = (location.state as { edit?: Campaign } | null)?.edit;
  const { addCampaign, updateCampaign } = useCampaigns();
  const { org, orgCollections, isSuperadmin } = useOrgResources();
  const [showNewCollection, setShowNewCollection] = useState(false);
  const organizationOptions = useOrganizationOptions();
  const shouldSkipCollectionOnCreate = isSuperadmin && !editCampaign;

  const [fields, setFields] = useState<FormFields>({
    title: editCampaign?.title ?? '',
    description: editCampaign?.description ?? '',
    sector: editCampaign?.sector ?? '',
    orgSlug: editCampaign?.orgSlug ?? '',
    collectionId: editCampaign?.collectionId ?? '',
    newCollectionName: '',
  });

  // Pre-popula el sector cuando la org carga (puede llegar después del primer render)
  useEffect(() => {
    if (org?.sector && !editCampaign) {
      setFields((prev) => ({ ...prev, sector: org.sector }));
    }
  }, [org?.sector, editCampaign]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SketchfabModel[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<SketchfabModel | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedUid = selectedModel?.uid ?? editCampaign?.sketchfabUid ?? null;

  function handleFieldChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) return;
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const result = await searchModels({
        keyword,
        count: 12,
        categories:
          'science-technology,animals-pets,nature-plants,cultural-heritage-history',
      });
      setSearchResults(result.results);
      if (result.results.length === 0)
        setSearchError('No se encontraron modelos para esa búsqueda.');
    } catch {
      setSearchError(
        'Error al buscar modelos. Verificá tu conexión o la API key de Sketchfab.'
      );
    } finally {
      setSearching(false);
    }
  }

  function handleSelectModel(model: SketchfabModel) {
    setSelectedModel(model);
    if (errors.model) setErrors((prev) => ({ ...prev, model: undefined }));
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!fields.title.trim()) newErrors.title = 'El título es obligatorio.';
    if (!fields.description.trim())
      newErrors.description = 'La descripción es obligatoria.';
    if (!fields.sector) newErrors.sector = 'Seleccioná un sector.';
    if (isSuperadmin && !editCampaign && !fields.orgSlug) {
      newErrors.orgSlug = 'Seleccioná una organización destino.';
    }
    if (!selectedUid) newErrors.model = 'Seleccioná un modelo 3D de Sketchfab.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    try {
      const collectionId = shouldSkipCollectionOnCreate
        ? undefined
        : fields.collectionId || undefined;

      const wantsNewCollection =
        !shouldSkipCollectionOnCreate &&
        showNewCollection &&
        fields.newCollectionName.trim().length > 0;

      const basePayload: CreateCampaignInput = {
        title: fields.title,
        description: fields.description,
        sector: fields.sector as Sector,
        sketchfabUid: selectedUid!,
      };

      if (!wantsNewCollection && collectionId) {
        basePayload.collectionId = collectionId;
      }

      if (wantsNewCollection) {
        basePayload.newCollectionName = fields.newCollectionName.trim();
      }

      if (editCampaign) {
        await updateCampaign(editCampaign.id, basePayload);
        setSubmittedId(editCampaign.id);
      } else {
        const payload =
          isSuperadmin && fields.orgSlug
            ? { ...basePayload, orgSlug: fields.orgSlug }
            : basePayload;
        const created = await addCampaign(payload);
        setSubmittedId(created.id);
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  }

  if (submitted) {
    return (
      <div className="cfp-page">
        <div className="cfp-success-card">
          <div className="cfp-success-icon">
            <CheckCircleIcon weight="fill" size={48} />
          </div>
          <h2 className="cfp-success-title">¡Campaña creada!</h2>
          <p className="cfp-success-msg">
            Tu QR ya está listo para usar en tus materiales.
          </p>
          <div className="cfp-success-actions">
            <button
              className="cfp-btn cfp-btn-primary"
              onClick={() =>
                navigate(`/admin/campanas/${submittedId}/qr`, {
                  state: { uid: selectedUid },
                })
              }
            >
              Ver QR generado
            </button>
            <button
              className="cfp-btn cfp-btn-secondary"
              onClick={() => navigate('/admin/campanas')}
            >
              Ver todas las campañas
            </button>
          </div>
        </div>
      </div>
    );
  }

  const previewThumb = selectedModel
    ? getBestThumbnail(selectedModel, 400)
    : null;

  return (
    <div className="cfp-page">
      <div className="cfp-header">
        <div className="cfp-header-text">
          <h1>{editCampaign ? 'Editar campaña' : 'Nueva campaña'}</h1>
          <p>
            Completá los datos y seleccioná un modelo 3D para generar el QR.
          </p>
        </div>
      </div>

      <div className="cfp-layout">
        <form className="cfp-form" onSubmit={handleSubmit} noValidate>
          <div
            className={`cfp-field ${errors.title ? 'cfp-field--error' : ''}`}
          >
            <label htmlFor="cfp-title">Título de campaña</label>
            <input
              id="cfp-title"
              name="title"
              type="text"
              placeholder="ej: Geometría 5° grado · Poliedros"
              value={fields.title}
              onChange={handleFieldChange}
            />
            {errors.title && (
              <span className="cfp-error-msg">{errors.title}</span>
            )}
          </div>

          <div
            className={`cfp-field ${errors.description ? 'cfp-field--error' : ''}`}
          >
            <label htmlFor="cfp-description">Descripción</label>
            <textarea
              id="cfp-description"
              name="description"
              rows={3}
              placeholder="ej: Escaneá el QR y explorá figuras 3D en tu living"
              value={fields.description}
              onChange={handleFieldChange}
            />
            {errors.description && (
              <span className="cfp-error-msg">{errors.description}</span>
            )}
          </div>

          {isSuperadmin && (
            <div
              className={`cfp-field ${errors.orgSlug ? 'cfp-field--error' : ''}`}
            >
              <label htmlFor="cfp-org">Organización destino</label>
              <select
                id="cfp-org"
                name="orgSlug"
                value={fields.orgSlug}
                onChange={handleFieldChange}
                disabled={Boolean(editCampaign)}
                className={errors.orgSlug ? 'cfp-input--error' : ''}
              >
                <option value="" disabled>
                  Seleccioná una organización
                </option>
                {organizationOptions.map((organization) => (
                  <option key={organization.slug} value={organization.slug}>
                    {organization.label}
                  </option>
                ))}
              </select>
              {errors.orgSlug && (
                <span className="cfp-error-msg">{errors.orgSlug}</span>
              )}
            </div>
          )}

          <div className="cfp-field">
            <label>Sector</label>
            {org?.sector ? (
              <div className="cfp-sector-fixed">
                <span className={`sector-badge sector-badge--${org.sector}`}>
                  {SECTOR_LABELS[org.sector]}
                </span>
              </div>
            ) : (
              <>
                <select
                  id="cfp-sector"
                  name="sector"
                  value={fields.sector}
                  onChange={handleFieldChange}
                  className={errors.sector ? 'cfp-input--error' : ''}
                >
                  <option value="" disabled>
                    Seleccioná un sector
                  </option>
                  {(Object.entries(SECTOR_LABELS) as [Sector, string][]).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
                {errors.sector && (
                  <span className="cfp-error-msg">{errors.sector}</span>
                )}
              </>
            )}
          </div>

          {!shouldSkipCollectionOnCreate && (
            <div className="cfp-field">
              <label htmlFor="cfp-collection">
                {org?.collectionLabel ?? 'Colección'}{' '}
                <span className="cfp-field-optional">(opcional)</span>
              </label>
              {!showNewCollection ? (
                <div className="cfp-collection-row">
                  <select
                    id="cfp-collection"
                    name="collectionId"
                    value={fields.collectionId}
                    onChange={handleFieldChange}
                  >
                    <option value="">
                      Sin {org?.collectionLabel?.toLowerCase() ?? 'colección'}
                    </option>
                    {orgCollections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="cfp-btn cfp-btn-ghost cfp-btn-new-col"
                    onClick={() => setShowNewCollection(true)}
                  >
                    + Nueva {org?.collectionLabel?.toLowerCase() ?? 'colección'}
                  </button>
                </div>
              ) : (
                <div className="cfp-collection-new">
                  <input
                    type="text"
                    name="newCollectionName"
                    placeholder={`Nombre de la ${org?.collectionLabel?.toLowerCase() ?? 'colección'}...`}
                    value={fields.newCollectionName}
                    onChange={handleFieldChange}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="cfp-btn cfp-btn-ghost"
                    onClick={() => {
                      setShowNewCollection(false);
                      setFields((prev) => ({ ...prev, newCollectionName: '' }));
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            className={`cfp-field ${errors.model ? 'cfp-field--error' : ''}`}
          >
            <label>Modelo 3D · buscar en Sketchfab</label>
            <div className="cfp-search-row">
              <input
                type="text"
                placeholder="ej: pyramid, solar system, cell..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e as unknown as React.FormEvent);
                  }
                }}
              />
              <button
                type="button"
                className="cfp-btn cfp-btn-search"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {errors.model && (
              <span className="cfp-error-msg">{errors.model}</span>
            )}
            {searchError && <p className="cfp-search-error">{searchError}</p>}

            {searchResults.length > 0 && (
              <div className="cfp-model-grid">
                {searchResults.map((model) => {
                  const thumb = getBestThumbnail(model, 200);
                  const isSelected = selectedModel?.uid === model.uid;
                  return (
                    <button
                      key={model.uid}
                      type="button"
                      className={`cfp-model-card ${isSelected ? 'cfp-model-card--selected' : ''}`}
                      onClick={() => handleSelectModel(model)}
                      title={model.name}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={model.name}
                          className="cfp-model-thumb"
                        />
                      ) : (
                        <div className="cfp-model-thumb cfp-model-thumb--placeholder">
                          3D
                        </div>
                      )}
                      <span className="cfp-model-name">{model.name}</span>
                      {isSelected && (
                        <CheckIcon
                          className="cfp-model-check"
                          weight="bold"
                          size={14}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="cfp-form-footer">
            <button
              type="button"
              className="cfp-btn cfp-btn-secondary"
              onClick={() => navigate('/admin/campanas')}
            >
              Cancelar
            </button>
            {submitError && (
              <span className="cfp-error-msg">{submitError}</span>
            )}
            <button type="submit" className="cfp-btn cfp-btn-primary">
              Guardar campaña
            </button>
          </div>
        </form>

        <aside className="cfp-preview">
          <div className="cfp-preview-card">
            <p className="cfp-preview-label">Vista previa del modelo</p>
            {selectedModel ? (
              <>
                {previewThumb && (
                  <img
                    src={previewThumb}
                    alt={selectedModel.name}
                    className="cfp-preview-img"
                  />
                )}
                <div className="cfp-preview-info">
                  <p className="cfp-preview-model-name">{selectedModel.name}</p>
                  <p className="cfp-preview-author">
                    por{' '}
                    <a
                      href={selectedModel.user.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedModel.user.displayName}
                    </a>
                  </p>
                  {selectedModel.license && (
                    <span className="cfp-preview-license">
                      {selectedModel.license.label}
                    </span>
                  )}
                  <UidCopyRow uid={selectedModel.uid} />
                </div>
              </>
            ) : editCampaign ? (
              <div className="cfp-preview-empty">
                <p className="cfp-preview-edit-label">Modelo actual</p>
                <UidCopyRow uid={editCampaign.sketchfabUid} />
                <p className="cfp-preview-edit-hint">
                  Buscá un modelo nuevo para reemplazarlo
                </p>
              </div>
            ) : (
              <div className="cfp-preview-empty">
                <CameraIcon
                  className="cfp-preview-empty-icon"
                  weight="thin"
                  size={40}
                />
                <p>Buscá y seleccioná un modelo 3D para verlo aquí.</p>
              </div>
            )}
          </div>

          {fields.title && (
            <div className="cfp-preview-card cfp-preview-summary">
              <p className="cfp-preview-label">Resumen de campaña</p>
              <p className="cfp-preview-summary-title">{fields.title}</p>
              {fields.sector && (
                <span className={`sector-badge sector-badge--${fields.sector}`}>
                  {SECTOR_LABELS[fields.sector as Sector]}
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
  );
}
