import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useNotification from '../services/useNotification';
import useAppointment from '../services/useAppointment';
import { IconBell, IconCheck, IconX, IconRefresh } from '../components/Icons';

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

  async function handleAcceptFromNotification(notif) {
    try {
      await acceptChange(notif.appointmentId);
      await markAsRead(notif._id);
      toast.success('Cambio de horario aceptado');
      loadNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleRejectFromNotification(notif) {
    try {
      await cancelAppointment(notif.appointmentId);
      await markAsRead(notif._id);
      toast.info('Turno cancelado');
      loadNotifications();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h4 className="section-title">
          <IconBell size={20} /> Notificaciones Pendientes
        </h4>
        <button onClick={loadNotifications}>
          <IconRefresh size={14} /> Actualizar
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="home-card" style={{ textAlign: 'center' }}>
          <p>No tenés notificaciones pendientes.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Asunto</th>
              <th>Detalle</th>
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
                  <button className="btn-primary" onClick={() => handleAcceptFromNotification(n)}>
                    <IconCheck size={14} /> Aceptar
                  </button>
                  <button className="btn-danger" onClick={() => handleRejectFromNotification(n)}>
                    <IconX size={14} /> Rechazar
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