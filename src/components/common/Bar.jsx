export function Bar({ pct, color }) {
  return (
    <div className="bar-track">
      <div
        className="bar-fill"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color || 'var(--blue)' }}
      />
    </div>
  );
}
