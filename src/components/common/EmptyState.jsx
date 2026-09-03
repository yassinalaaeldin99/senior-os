export function EmptyState({ icon = '📋', title, text, actionText, onAction }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-dim)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--bg-elev)',
          border: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          marginBottom: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {icon}
      </div>
      {title && (
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
          {title}
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--text-faint)', maxWidth: 360, lineHeight: 1.5, marginBottom: onAction ? 14 : 0 }}>
        {text}
      </div>
      {onAction && actionText && (
        <button onClick={onAction} className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>
          {actionText}
        </button>
      )}
    </div>
  );
}
