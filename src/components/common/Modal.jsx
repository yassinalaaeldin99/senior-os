export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card-hi fade-in modal-responsive"
        style={{
          width: wide ? 640 : 460,
          overflowY: 'auto',
          padding: 22,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="display" style={{ fontSize: 19, fontWeight: 600 }}>
            {title}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13, minWidth: 36, minHeight: 36 }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
