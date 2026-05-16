import { useState } from 'react'
import { ventureCategories } from '../lib/constants'
import { readFileAsDataUrl } from '../services/uploadService'
import type { VentureFormValues } from '../types/forms'

type VentureFormProps = {
  initialValues: VentureFormValues
  submitLabel: string
  onSubmit: (values: VentureFormValues) => void
}

const networkFields = [
  'instagram',
  'tiktok',
  'facebook',
  'youtube',
  'spotify',
  'x',
  'linkedin',
  'website',
  'whatsapp',
  'behance',
  'github',
] as const

export function VentureForm({ initialValues, submitLabel, onSubmit }: VentureFormProps) {
  const [values, setValues] = useState<VentureFormValues>(initialValues)
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>, field: 'logoURL' | 'coverURL') {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    try {
      const preview = await readFileAsDataUrl(file)
      setValues((current) => ({ ...current, [field]: preview }))
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      className="panel venture-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(values)
      }}
    >
      <div className="form-grid">
        <label className="field field--full">
          <span>Nombre del emprendimiento</span>
          <input
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Cafe Arcana"
          />
        </label>

        <label className="field">
          <span>Categoria</span>
          <select
            required
            value={values.category}
            onChange={(event) => setValues((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">Selecciona una categoria</option>
            {ventureCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Subcategoria</span>
          <input
            value={values.subcategory}
            onChange={(event) => setValues((current) => ({ ...current, subcategory: event.target.value }))}
            placeholder="Cafe de especialidad"
          />
        </label>

        <label className="field">
          <span>Pais</span>
          <input
            required
            value={values.country}
            onChange={(event) => setValues((current) => ({ ...current, country: event.target.value }))}
            placeholder="Colombia"
          />
        </label>

        <label className="field">
          <span>Ciudad</span>
          <input
            value={values.city}
            onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
            placeholder="Bogota"
          />
        </label>

        <label className="field field--full">
          <span>Descripcion corta</span>
          <textarea
            required
            rows={4}
            maxLength={240}
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            placeholder="Cuenta rapido que haces y por que vale la pena seguirte."
          />
          <small>{values.description.length}/240</small>
        </label>

        <label className="field field--full">
          <span>Tags</span>
          <input
            value={values.tags}
            onChange={(event) => setValues((current) => ({ ...current, tags: event.target.value }))}
            placeholder="cafe, comunidad, branding"
          />
        </label>

        <label className="field">
          <span>Logo URL</span>
          <input
            value={values.logoURL}
            onChange={(event) => setValues((current) => ({ ...current, logoURL: event.target.value }))}
            placeholder="https://..."
          />
        </label>

        <label className="field">
          <span>Subir logo</span>
          <input type="file" accept="image/*" onChange={(event) => void handleImageUpload(event, 'logoURL')} />
        </label>

        <label className="field">
          <span>Cover URL</span>
          <input
            value={values.coverURL}
            onChange={(event) => setValues((current) => ({ ...current, coverURL: event.target.value }))}
            placeholder="https://..."
          />
        </label>

        <label className="field">
          <span>Subir cover</span>
          <input type="file" accept="image/*" onChange={(event) => void handleImageUpload(event, 'coverURL')} />
        </label>
      </div>

      <section className="panel-section">
        <h3>Redes sociales</h3>
        <div className="form-grid">
          {networkFields.map((field) => (
            <label key={field} className="field">
              <span>{field}</span>
              <input
                value={values.socialLinks[field] ?? ''}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    socialLinks: {
                      ...current.socialLinks,
                      [field]: event.target.value,
                    },
                  }))
                }
                placeholder={`URL de ${field}`}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Contacto publico</h3>
        <div className="form-grid">
          <label className="field">
            <span>Email publico</span>
            <input
              type="email"
              value={values.contact.publicEmail}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  contact: {
                    ...current.contact,
                    publicEmail: event.target.value,
                  },
                }))
              }
              placeholder="hola@tuemprendimiento.com"
            />
          </label>

          <label className="field">
            <span>Telefono</span>
            <input
              value={values.contact.phone}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  contact: {
                    ...current.contact,
                    phone: event.target.value,
                  },
                }))
              }
              placeholder="+57 300 000 0000"
            />
          </label>

          <label className="field">
            <span>WhatsApp de contacto</span>
            <input
              value={values.contact.whatsapp}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  contact: {
                    ...current.contact,
                    whatsapp: event.target.value,
                  },
                }))
              }
              placeholder="https://wa.me/..."
            />
          </label>
        </div>
      </section>

      <div className="button-row">
        <button className="button button--primary" type="submit" disabled={uploading}>
          {uploading ? 'Procesando imagen...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
