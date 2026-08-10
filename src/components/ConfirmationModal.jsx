function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmDisabled = false,
  cancelDisabled = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title || "Confirmation"}
      >
        <h2>{title || "Please confirm"}</h2>
        <p>{message || "Are you sure you want to continue?"}</p>
        <div className="actions">
          <button
            type="button"
            className="button"
            onClick={onCancel}
            disabled={cancelDisabled}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="button danger"
            onClick={onConfirm}
            disabled={confirmDisabled}
            aria-busy={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
