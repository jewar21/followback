import { useState } from 'react'
import { reportReasons } from '../lib/constants'

type ReportModalProps = {
  ventureName: string
  onClose: () => void
  onSubmit: (reason: string, description: string) => void
}

export function ReportModal({ ventureName, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState(reportReasons[0])
  const [description, setDescription] = useState('')

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h3>Reportar {ventureName}</h3>
        <p>Usá este formulario solo para contenido engañoso, spam o datos públicos problemáticos.</p>
        <label className="field">
          <span>Motivo</span>
          <select value={reason} onChange={(event) => setReason(event.target.value)}>
            {reportReasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Descripción</span>
          <textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explicá qué debería revisar el equipo."
          />
        </label>
        <div className="button-row">
          <button className="button button--ghost" onClick={onClose}>
            Cerrar
          </button>
          <button className="button button--primary" onClick={() => onSubmit(reason, description)}>
            Enviar reporte
          </button>
        </div>
      </div>
    </div>
  )
}
