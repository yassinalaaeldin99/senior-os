export function Field({ label, children, style }) {
  return (
    <label style={{ display: 'block', flex: 1, minWidth: 0, marginBottom: 12, width: '100%', ...style }}>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 5, fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </label>
  );
}
