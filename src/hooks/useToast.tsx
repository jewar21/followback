import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ToastTone = 'neutral' | 'success' | 'danger'

type ToastItem = {
  id: string
  tone: ToastTone
  message: string
}

type ToastContextValue = {
  pushToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    if (toasts.length === 0) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1))
    }, 3200)

    return () => window.clearTimeout(timer)
  }, [toasts])

  function pushToast(message: string, tone: ToastTone = 'neutral') {
    setToasts((current) => [...current, { id: crypto.randomUUID(), message, tone }])
  }

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider.')
  }

  return context
}
