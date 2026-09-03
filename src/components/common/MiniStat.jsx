export function MiniStat({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="display" style={{ fontSize: 19, fontWeight: 600 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>{label}</div>
    </div>
  );
}
