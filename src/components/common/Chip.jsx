export function Chip({ children, color, bg }) {
  return (
    <span className="chip" style={{ color, background: bg }}>
      {children}
    </span>
  );
}
