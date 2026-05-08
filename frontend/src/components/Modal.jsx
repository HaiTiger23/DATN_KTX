export default function Modal({ open, title, children, onClose, onSave, saveLabel = 'Lưu' }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-content glass" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="close-modal" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline close-modal" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
