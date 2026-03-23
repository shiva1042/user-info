import { useEffect, useRef } from 'react'

function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', variant = 'danger' }) {
  const confirmBtnRef = useRef(null)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    confirmBtnRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="confirm-modal">
        <h3 id="confirm-title">{title}</h3>
        <p id="confirm-desc">{message}</p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={variant === 'danger' ? 'confirm-danger' : 'confirm-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
