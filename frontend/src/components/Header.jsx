// === src/components/Header.jsx ===
import useGlobal from '../services/useGlobal';
import { LogoOtto, IconMenu, IconUser } from './Icons';

export default function Header({ onClickMenu }) {
  const { username, role } = useGlobal();

  const roleLabels = {
    admin: 'ADMINISTRADOR',
    barber: 'BARBERO',
    user: 'CLIENTE',
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <button className="menu-toggle-btn" onClick={() => onClickMenu()} title="Alternar menú">
          <IconMenu size={20} />
        </button>
        <LogoOtto size={46} />
        <div className="brand-text">
          <h1>BARBERÍA OTTO</h1>
          <span className="brand-subtitle">DESDE 2017</span>
        </div>
      </div>

      <div>
        {username && (
          <div className="user-badge">
            <IconUser size={16} />
            <span className="username-text">{username}</span>
            {role && <span className="role-pill">{roleLabels[role] || role}</span>}
          </div>
        )}
      </div>
    </header>
  );
}