interface ConfirmDialogProps {
  open:          boolean
  title:         string
  message:       string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:      'default' | 'danger'
  onConfirm:     () => void
  onCancel:      () => void
}


export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="confirm-dialog-actions">
          <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
