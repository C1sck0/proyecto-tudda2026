import MenuItem from './MenuItem';
import useGlobal from '../services/useGlobal';

export default function Menu({ visible = true }) {
  const { role, username } = useGlobal();
  const isAdmin = role === 'admin';
  const isBarber = role === 'barber';
  const isUser = role === 'user';

  function logout() {
    localStorage.removeItem('session');
    window.location.href = '/login';
  }

  return (
    <nav
      className="sidebar-menu"
      style={{
        display: visible ? 'flex' : 'none',
      }}
    >
      <MenuItem to="/">Inicio</MenuItem>
      {!username && <MenuItem to="/login">Iniciar Sesión</MenuItem>}

      {(isAdmin || isBarber || isUser) && (
        <MenuItem to="/appointments">Agenda de Turnos</MenuItem>
      )}

      {(isUser || isAdmin) && (
        <MenuItem to="/appointments/new">Reservar Turno</MenuItem>
      )}

      {(isUser || isAdmin) && (
        <MenuItem to="/notifications">Notificaciones</MenuItem>
      )}

      {isAdmin && <MenuItem to="/users">Gestión de Usuarios</MenuItem>}

      <MenuItem to="/about">Acerca de</MenuItem>
      {username && <MenuItem onClick={logout}>Cerrar Sesión</MenuItem>}
    </nav>
  );
}