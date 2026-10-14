import useGlobal from '../services/useGlobal';

export default function Header({ onClickMenu }) {
  const { username, role } = useGlobal();

  const roleLabels = {
    admin: 'Administrador',
    barber: 'Barbero',
    user: 'Cliente',
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="menu-toggle-btn" onClick={() => onClickMenu()} title="Alternar menú">
          ☰
        </button>
        <h1>💈 Agenda Peluquería</h1>
      </div>
      <div>
        {username ? (
          <div className="user-badge">
            <span>👤 <strong>{username}</strong></span>
            {role && <span className="role-pill">{roleLabels[role] || role}</span>}
          </div>
        ) : (
          <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>Sin sesión activa</span>
        )}
      </div>
    </header>
  );
}