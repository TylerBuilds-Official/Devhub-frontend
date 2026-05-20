import { createContext, useContext } from 'react'


export type ToastKind = 'success' | 'error' | 'info'


export interface ToastApi {
  success: (message: string, durationMs?: number) => void
  error:   (message: string, durationMs?: number) => void
  info:    (message: string, durationMs?: number) => void
  dismiss: (id: number) => void
}


export const ToastContext = createContext<ToastApi | null>(null)


export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast() called outside <ToastProvider>')
  return api
}
