export function StatCard({ label, value, sub, onClick, small }) {
  return (
    <div className="card card-interactive" style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px', marginBottom: 6 }}>
        {label}
      </div>
      <div className="display" style={{ fontSize: small ? 18 : 24, fontWeight: 700, color: 'var(--text)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}
