import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useNotification from '../services/useNotification';
import useAppointment from '../services/useAppointment';

export default function Notifications() {
  const { getNotifications, markAsRead } = useNotification();
  const { acceptChange, cancelAppointment } = useAppointment();
  const [notifications, setNotifications] = useState([]);

  async function loadNotifications() {
    try {
      const res = await getNotifications();
      setNotifications(res);
    } catch (error) {
      toast.error(error.message || 'Error al cargar notificaciones');
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleArchive(id) {
    try {
      await markAsRead(id);
      toast.success('Notificación marcada como leída');
      loadNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleAcceptFromNotification(notif) {
    try {
      await acceptChange(notif.appointmentId);
      await markAsRead(notif._id);
      toast.success('Cambio de horario aceptado y notificación archivada');
      loadNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleRejectFromNotification(notif) {
    try {
      await cancelAppointment(notif.appointmentId);
      await markAsRead(notif._id);
      toast.info('Turno cancelado y notificación archivada');
      loadNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h4>🔔 Mis Notificaciones Pendientes</h4>
        <button onClick={loadNotifications}>🔄 Actualizar</button>
      </div>

      {notifications.length === 0 ? (
        <p>No tenés notificaciones pendientes por leer.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Mensaje</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n._id}>
                <td><strong>{n.title}</strong></td>
                <td>{n.message}</td>
                <td>{new Date(n.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleAcceptFromNotification(n)}>
                    ✅ Aceptar cambio
                  </button>
                  <button onClick={() => handleRejectFromNotification(n)}>
                    ❌ Rechazar / Cancelar
                  </button>
                  <button onClick={() => handleArchive(n._id)}>
                    Archivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}