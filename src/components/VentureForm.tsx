import { useMemo, useState } from 'react'
import { socialNetworkLabels, ventureCategories } from '../lib/constants'
import {
  getCitiesForCountryAndDepartment,
  getDepartmentsForCountry,
  hasStructuredLocationsForCountry,
  PRIMARY_COUNTRY_NAME,
} from '../lib/geo'
import { readFileAsDataUrl } from '../services/uploadService'
import type { VentureFormValues } from '../types/forms'

type VentureFormProps = {
  readonly initialValues: VentureFormValues
  readonly submitLabel: string
  readonly onSubmit: (values: VentureFormValues) => void
  readonly mode?: 'onboarding' | 'full'
}

const primaryNetworkFields = ['instagram', 'tiktok', 'website', 'whatsapp'] as const
const secondaryNetworkFields = ['facebook', 'youtube', 'spotify', 'x', 'linkedin', 'behance', 'github'] as const

export function VentureForm({ initialValues, submitLabel, onSubmit, mode = 'full' }: VentureFormProps) {
  const [values, setValues] = useState<VentureFormValues>(() => ({
    ...initialValues,
    country: initialValues.country || PRIMARY_COUNTRY_NAME,
  }))
  const [uploading, setUploading] = useState(false)
  const [showExtraFields, setShowExtraFields] = useState(mode === 'full')
  const isOnboarding = mode === 'onboarding'
  const usesStructuredLocation = hasStructuredLocationsForCountry(values.country)
  const departmentOptions = useMemo(() => getDepartmentsForCountry(values.country), [values.country])
  const citySuggestions = useMemo(
    () => getCitiesForCountryAndDepartment(values.country, values.department),
    [values.country, values.department],
  )

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

  function updateSocialLink(field: keyof VentureFormValues['socialLinks'], value: string) {
    setValues((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [field]: value,
      },
    }))
  }

  function updateContact(field: keyof VentureFormValues['contact'], value: string) {
    setValues((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }))
  }

  return (
    <form
      className="panel venture-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(values)
      }}
    >
      {isOnboarding ? (
        <div className="onboarding-form-intro">
          <strong>Empezá con lo mínimo</strong>
          <p>Publicá tu perfil con los datos esenciales.</p>
        </div>
      ) : null}

      <div className="form-grid">
        <label className="field field--full">
          <span>Nombre del emprendimiento</span>
          <input
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Café Arcana"
          />
        </label>

        <label className="field">
          <span>Categoría</span>
          <select
            required
            value={values.category}
            onChange={(event) => setValues((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">Seleccioná una categoría</option>
            {ventureCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>País</span>
          <input value={PRIMARY_COUNTRY_NAME} disabled readOnly />
          <small>Por ahora Voseguime está concentrado en Colombia.</small>
        </label>

        <label className="field">
          <span>Departamento</span>
          {usesStructuredLocation ? (
            <select
              required
              value={values.department}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  department: event.target.value,
                  city: '',
                }))
              }
              disabled={!values.country}
            >
              <option value="">Seleccioná un departamento</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={values.department}
              onChange={(event) => setValues((current) => ({ ...current, department: event.target.value }))}
              placeholder={values.country ? 'Escribí tu departamento o provincia' : 'Primero elegí un país'}
              disabled={!values.country}
            />
          )}
        </label>

        <label className="field">
          <span>Ciudad</span>
          {usesStructuredLocation ? (
            <select
              required
              value={values.city}
              onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
              disabled={!values.department}
            >
              <option value="">{values.department ? 'Seleccioná una ciudad' : 'Primero elegí un departamento'}</option>
              {citySuggestions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={values.city}
              onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
              placeholder={values.country ? 'Escribí tu ciudad' : 'Primero elegí un país'}
              disabled={!values.country}
            />
          )}
        </label>

        <label className="field field--full">
          <span>Descripción corta</span>
          <textarea
            rows={4}
            maxLength={240}
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            placeholder="Contá rápido qué hacés y por qué vale la pena seguirte."
          />
          <small>{values.description.length}/240</small>
        </label>
      </div>

      <section className="panel-section">
        <div className="section-heading section-heading--stack">
          <div>
            <h2>Red principal</h2>
            <p>Con una sola red o sitio web ya podés aparecer en el directorio.</p>
          </div>
        </div>
        <div className="form-grid">
          {primaryNetworkFields.map((field) => (
            <label key={field} className="field">
              <span>{socialNetworkLabels[field]}</span>
              <input
                value={values.socialLinks[field] ?? ''}
                onChange={(event) => updateSocialLink(field, event.target.value)}
                placeholder={field === 'whatsapp' ? 'https://wa.me/...' : `URL de ${socialNetworkLabels[field]}`}
              />
            </label>
          ))}
        </div>
      </section>

      {isOnboarding ? (
        <div className="onboarding-extra-actions">
          <button
            className="button button--ghost button--block"
            type="button"
            onClick={() => setShowExtraFields((current) => !current)}
          >
            {showExtraFields ? 'Ocultar campos extra' : 'Quiero completar más datos ahora'}
          </button>
          <p className="muted-text">También vas a poder completar estos datos más tarde desde Ajustes.</p>
        </div>
      ) : null}

      {showExtraFields ? (
        <>
          <section className="panel-section">
            <h3>Datos complementarios</h3>
            <div className="form-grid">
              <label className="field">
                <span>Subcategoría</span>
                <input
                  value={values.subcategory}
                  onChange={(event) => setValues((current) => ({ ...current, subcategory: event.target.value }))}
                  placeholder="Café de especialidad"
                />
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
          </section>

          <section className="panel-section">
            <h3>Redes adicionales</h3>
            <div className="form-grid">
              {secondaryNetworkFields.map((field) => (
                <label key={field} className="field">
                  <span>{socialNetworkLabels[field]}</span>
                  <input
                    value={values.socialLinks[field] ?? ''}
                    onChange={(event) => updateSocialLink(field, event.target.value)}
                    placeholder={`URL de ${socialNetworkLabels[field]}`}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="panel-section">
            <h3>Contacto público</h3>
            <div className="form-grid">
              <label className="field">
                <span>Email público</span>
                <input
                  type="email"
                  value={values.contact.publicEmail}
                  onChange={(event) => updateContact('publicEmail', event.target.value)}
                  placeholder="hola@tuemprendimiento.com"
                />
              </label>

              <label className="field">
                <span>Teléfono</span>
                <input
                  value={values.contact.phone}
                  onChange={(event) => updateContact('phone', event.target.value)}
                  placeholder="+57 300 000 0000"
                />
              </label>

              <label className="field">
                <span>WhatsApp de contacto</span>
                <input
                  value={values.contact.whatsapp}
                  onChange={(event) => updateContact('whatsapp', event.target.value)}
                  placeholder="https://wa.me/..."
                />
              </label>
            </div>
          </section>
        </>
      ) : null}

      <div className="button-row">
        <button className={`button button--primary ${isOnboarding ? 'button--block' : ''}`} type="submit" disabled={uploading}>
          {uploading ? 'Procesando imagen...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
