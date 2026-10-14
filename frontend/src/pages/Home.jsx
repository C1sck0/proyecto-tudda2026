// === src/pages/Home.jsx ===
import { useNavigate } from 'react-router-dom';
import useGlobal from '../services/useGlobal';

export default function Home() {
  const { username, role } = useGlobal();
  const navigate = useNavigate();

  return (
    <div className="home-card">
      <h2>Bienvenido a Agenda Peluquería 💈</h2>
      <p>Sistema integral de reservas, gestión de barberos y notificaciones en tiempo real.</p>

      {!username ? (
        <div style={{ marginTop: '1.5em' }}>
          <p>Iniciá sesión para gestionar tus turnos o administrar la peluquería.</p>
          <button onClick={() => navigate('/login')}>Ir a Iniciar Sesión</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px', marginTop: '1.5em', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/appointments')}>📅 Ver Agenda de Turnos</button>
          {(role === 'user' || role === 'admin') && (
            <>
              <button onClick={() => navigate('/appointments/new')}>✂️ Solicitar Turno</button>
              <button onClick={() => navigate('/notifications')}>🔔 Ver Notificaciones</button>
            </>
          )}
          {role === 'admin' && (
            <button onClick={() => navigate('/users')}>👥 Administrar Usuarios</button>
          )}
        </div>
      )}
    </div>
  );
}