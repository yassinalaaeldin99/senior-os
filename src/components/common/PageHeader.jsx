export function PageHeader({ title, action, actionLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div className="display" style={{ fontSize: 23, fontWeight: 600 }}>
        {title}
      </div>
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
