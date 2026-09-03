export function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4, fontWeight: 500 }}>
        {label}
      </div>
      {children}
    </label>
  );
}
