import { useState } from 'react';
import { PencilSimpleIcon, TrashIcon, PlusIcon } from '@phosphor-icons/react';
import { useCollections } from '../context/CollectionsContext';
import { useCampaigns } from '../context/CampaignsContext';
import { useOrgResources } from '../hooks/useOrgResources';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '@/components/ConfirmDialog';
import type { Collection } from '../types';
import './CollectionsPage.css';

interface CollectionFormData {
  name: string;
  description?: string;
}

interface CollectionFormProps {
  initial?: Collection;
  onSave: (data: CollectionFormData) => void;
  onCancel: () => void;
}

function CollectionForm({ initial, onSave, onCancel }: CollectionFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [nameErr, setNameErr] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameErr('El nombre es obligatorio.');
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  return (
    <form className="col-form" onSubmit={handleSubmit} noValidate>
      <div
        className={`col-form-field ${nameErr ? 'col-form-field--error' : ''}`}
      >
        <label>Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameErr('');
          }}
          placeholder="ej: Llaves Matemática"
          autoFocus
        />
        {nameErr && <span className="col-form-error">{nameErr}</span>}
      </div>
      <div className="col-form-field">
        <label>
          Descripción <span className="col-form-optional">(opcional)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="ej: Serie Primaria para todas las áreas"
        />
      </div>
      <div className="col-form-actions">
        <button
          type="button"
          className="col-btn col-btn--secondary"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button type="submit" className="col-btn col-btn--primary">
          {initial ? 'Guardar cambios' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

export function CollectionsPage() {
  const { addCollection, updateCollection, deleteCollection } =
    useCollections();
  const { campaigns } = useCampaigns();
  const { org, orgCollections } = useOrgResources();
  const { user } = useAuth();
  const confirm = useConfirm();
  const isSuperadmin = user?.role === 'superadmin';

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const label = org?.collectionLabel ?? 'Colección';
  const labelPlural = org?.collectionLabelPlural ?? 'Colecciones';

  function campaignCount(collectionId: string) {
    return campaigns.filter((c) => c.collectionId === collectionId).length;
  }

  return (
    <div className="colp-page">
      <div className="colp-header">
        <div>
          <h1>{labelPlural}</h1>
          <p>
            {org?.name} · Organizá tus campañas por {label.toLowerCase()}
          </p>
        </div>
        {isSuperadmin && !adding && (
          <button
            className="col-btn col-btn--primary"
            onClick={() => setAdding(true)}
          >
            <PlusIcon weight="bold" size={14} /> Nueva {label}
          </button>
        )}
      </div>

      {adding && (
        <div className="colp-form-wrap">
          <h2 className="colp-form-title">Nueva {label}</h2>
          <CollectionForm
            onSave={(data) => {
              addCollection(data);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {orgCollections.length === 0 && !adding ? (
        <div className="colp-empty">
          <p>
            No hay {labelPlural.toLowerCase()} configuradas para esta
            organización.
          </p>
        </div>
      ) : (
        <div className="colp-list">
          {orgCollections.map((col) => (
            <div key={col.id} className="colp-item">
              {editingId === col.id ? (
                <CollectionForm
                  initial={col}
                  onSave={(data) => {
                    updateCollection(col.id, data);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="colp-item-main">
                    <div className="colp-item-dot" />
                    <div className="colp-item-text">
                      <span className="colp-item-name">{col.name}</span>
                      {col.description && (
                        <span className="colp-item-desc">
                          {col.description}
                        </span>
                      )}
                    </div>
                    <span className="colp-item-count">
                      {campaignCount(col.id)} campaña
                      {campaignCount(col.id) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isSuperadmin && (
                    <div className="colp-item-actions">
                      <button
                        className="col-btn col-btn--ghost"
                        onClick={() => setEditingId(col.id)}
                      >
                        <PencilSimpleIcon weight="regular" size={14} /> Editar
                      </button>
                      <button
                        className="col-btn col-btn--danger"
                        onClick={async () => {
                          const linked = campaignCount(col.id);
                          const ok = await confirm({
                            title: `Eliminar ${label.toLowerCase()}`,
                            message:
                              linked > 0
                                ? `"${col.name}" tiene ${linked} campaña${linked === 1 ? '' : 's'} asociada${linked === 1 ? '' : 's'}. Las campañas quedaran sin coleccion. ¿Continuar?`
                                : `Vas a eliminar "${col.name}". Esta accion no se puede deshacer.`,
                            confirmLabel: 'Eliminar',
                            variant: 'danger',
                          });
                          if (ok) await deleteCollection(col.id);
                        }}
                      >
                        <TrashIcon weight="regular" size={14} /> Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
