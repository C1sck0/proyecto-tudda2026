import { useNavigate } from 'react-router-dom';
import useGlobal from '../services/useGlobal';
import { LogoOtto, IconCalendar, IconScissors, IconUsers, IconBell } from '../components/Icons';

export default function Home() {
  const { username, role } = useGlobal();
  const navigate = useNavigate();

  return (
    <div className="home-card otto-hero">
      <div style={{ marginBottom: '1rem' }}>
        <LogoOtto size={120} />
      </div>
      <h2 className="otto-title">BARBERÍA OTTO</h2>
      <p className="otto-subtitle">SISTEMA DE GESTIÓN DE TURNOS</p>

      {!username ? (
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
          <button onClick={() => navigate('/register')}>
            <IconScissors size={16} /> Registrarme y Sacar Turno
          </button>
        </div>
      ) : (
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/appointments')}>
            <IconCalendar size={16} /> Agenda de Turnos
          </button>

          <button onClick={() => navigate('/appointments/new')}>
            <IconScissors size={16} /> Reservar Turno
          </button>

          {role === 'user' && (
            <button onClick={() => navigate('/notifications')}>
              <IconBell size={16} /> Mis Notificaciones
            </button>
          )}

          {(role === 'admin' || role === 'barber') && (
            <button onClick={() => navigate('/users')}>
              <IconUsers size={16} /> {role === 'barber' ? 'Mis Clientes' : 'Usuarios'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}