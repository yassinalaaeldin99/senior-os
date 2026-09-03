export function SectionTitle({ children, style }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, ...style }}>
      {children}
    </div>
  );
}
