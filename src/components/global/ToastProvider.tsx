/**
 * Toast notifications.
 *
 * One provider at the root exposes `useToast()` → `{ success, error, info }`.
 * Every callsite gets a consistent transient feedback mechanism instead
 * of cobbling together per-component error strips.
 *
 * Toasts auto-dismiss after a duration (defaults per severity), are
 * dismissable by click, and stack in the bottom-right corner.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

import { ToastContext, type ToastApi, type ToastKind } from './toastContext'


interface Toast {
  id:        number
  kind:      ToastKind
  message:   string
  duration:  number    // ms; 0 = sticky
}


const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 3500,
  info:    4000,
  error:   6000,
}


export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId              = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((kind: ToastKind, message: string, durationMs?: number) => {
    const id = nextId.current++
    const duration = durationMs ?? DEFAULT_DURATION[kind]
    setToasts(prev => [...prev, { id, kind, message, duration }])
  }, [])

  const api = useMemo<ToastApi>(() => ({
    success: (m, d) => push('success', m, d),
    error:   (m, d) => push('error',   m, d),
    info:    (m, d) => push('info',    m, d),
    dismiss,
  }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}


function ToastViewport({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: number) => void }) {
  return (
    <div className="toast-viewport" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}


function ToastItem({ toast, onDismiss }: { toast: Toast, onDismiss: (id: number) => void }) {
  useEffect(() => {
    if (toast.duration <= 0) return
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => window.clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const Icon = toast.kind === 'success' ? CheckCircle2
             : toast.kind === 'error'   ? AlertCircle
             : Info

  return (
    <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <Icon className="toast-icon" size={14} strokeWidth={2} />
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-dismiss"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={12} />
      </button>
    </div>
  )
}
