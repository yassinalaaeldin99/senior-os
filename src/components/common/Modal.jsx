export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card-hi fade-in"
        style={{
          width: wide ? 640 : 460,
          maxWidth: '92vw',
          maxHeight: '86vh',
          overflowY: 'auto',
          padding: 22,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="display" style={{ fontSize: 19, fontWeight: 600 }}>
            {title}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 10px' }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
