export default function Notifications() {
  return (
    <div className="page-content page-fade-in">
      <div className="container-sm">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 28 }}>Notifications</h1>
        <div className="empty-state">
          <h3>No notifications</h3>
          <p>You're all caught up! Check back later for updates.</p>
        </div>
      </div>
    </div>
  );
}
