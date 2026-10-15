import MenuItem from './MenuItem';
import useGlobal from '../services/useGlobal';
import { IconCalendar, IconScissors, IconUsers, IconBell, IconLogout, IconUser } from './Icons';

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
      <div className="menu-group">
        <span className="menu-group-label">PRINCIPAL</span>
        <MenuItem to="/">Inicio</MenuItem>

        {!username && (
          <>
            <MenuItem to="/login">
              <IconUser size={16} /> Iniciar Sesión
            </MenuItem>
            <MenuItem to="/register">
              <IconScissors size={16} /> Registrarse
            </MenuItem>
          </>
        )}

        {username && (
          <>
            <MenuItem to="/appointments">
              <IconCalendar size={16} /> Agenda de Turnos
            </MenuItem>
            <MenuItem to="/appointments/new">
              <IconScissors size={16} /> Reservar Turno
            </MenuItem>
          </>
        )}

        {isUser && (
          <MenuItem to="/notifications">
            <IconBell size={16} /> Notificaciones
          </MenuItem>
        )}
      </div>

      {(isAdmin || isBarber) && (
        <div className="menu-group">
          <span className="menu-group-label">ADMINISTRACIÓN</span>
          <MenuItem to="/users">
            <IconUsers size={16} /> {isBarber ? 'Mis Clientes' : 'Usuarios'}
          </MenuItem>
        </div>
      )}

      {username && (
        <div className="menu-footer">
          <MenuItem onClick={logout}>
            <IconLogout size={16} /> Cerrar Sesión
          </MenuItem>
        </div>
      )}
    </nav>
  );
}