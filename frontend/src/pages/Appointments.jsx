import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import useAppointment from '../services/useAppointment';
import useGlobal from '../services/useGlobal';

export default function Appointments() {
  const navigate = useNavigate();
  const {
    getAppointments,
    confirmAppointment,
    cancelAppointment,
    proposeMove,
    acceptChange,
  } = useAppointment();
  const { username, role } = useGlobal();
  const [list, setList] = useState([]);

  async function loadList() {
    try {
      const res = await getAppointments();
      // Si es cliente, filtramos para que vea sus propios turnos; si es barbero, los suyos; admin ve todos
      if (role === 'user') {
        setList(res.filter(app => app.customerName === username));
      } else if (role === 'barber') {
        setList(res.filter(app => app.barberUsername === username));
      } else {
        setList(res);
      }
    } catch (error) {
      toast.error(error.message || 'No se pudo obtener la lista de turnos');
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  async function handleConfirm(id) {
    try {
      await confirmAppointment(id);
      toast.success('Turno confirmado con éxito');
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleProposeMove(id) {
    const { value: newDate } = await Swal.fire({
      title: 'Proponer nuevo horario',
      input: 'text',
      inputLabel: 'Ingresá la nueva fecha y hora (Ej: 2026-10-26 18:00)',
      inputPlaceholder: 'AAAA-MM-DD HH:mm',
      showCancelButton: true,
      confirmButtonText: 'Enviar propuesta',
      cancelButtonText: 'Cancelar',
    });

    if (newDate) {
      try {
        await proposeMove(id, newDate);
        toast.info('Propuesta enviada y notificación creada para el cliente');
        loadList();
      } catch (err) {
        toast.error(err.message);
      }
    }
  }

  async function handleAcceptChange(id) {
    try {
      await acceptChange(id);
      toast.success('Nuevo horario aceptado y turno confirmado');
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleCancel(id) {
    const result = await Swal.fire({
      title: '¿Cancelar este turno?',
      text: 'El turno pasará a estado cancelado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
    });

    if (result.isConfirmed) {
      try {
        await cancelAppointment(id);
        toast.success('Turno cancelado');
        loadList();
      } catch (err) {
        toast.error(err.message);
      }
    }
  }

  const statusBadge = (status) => {
    const map = {
      pending: { text: '⏳ Pendiente', color: '#ca8a04' },
      proposed_change: { text: '🔄 Cambio propuesto', color: '#2563eb' },
      confirmed: { text: '✅ Confirmado', color: '#16a34a' },
      cancelled: { text: '❌ Cancelado', color: '#dc2626' },
    };
    const item = map[status] || { text: status, color: '#475569' };
    return <span style={{ color: item.color, fontWeight: 'bold' }}>{item.text}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h4>📅 Agenda de Turnos</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(role === 'user' || role === 'admin') && (
            <button onClick={() => navigate('/appointments/new')}>+ Nuevo Turno</button>
          )}
          <button onClick={loadList}>🔄 Actualizar</button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Barbero</th>
            <th>Fecha Original</th>
            <th>Fecha Propuesta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '1em' }}>
                No hay turnos registrados para mostrar.
              </td>
            </tr>
          ) : (
            list.map(row => (
              <tr key={row.id}>
                <td>{row.customerName}</td>
                <td>{row.barberUsername}</td>
                <td>{row.date}</td>
                <td>{row.proposedDate || '—'}</td>
                <td>{statusBadge(row.status)}</td>
                <td>
                  {(role === 'barber' || role === 'admin') && row.status === 'pending' && (
                    <button onClick={() => handleConfirm(row.id)}>Confirmar</button>
                  )}

                  {(role === 'barber' || role === 'admin') && row.status !== 'cancelled' && (
                    <button onClick={() => handleProposeMove(row.id)}>Proponer cambio</button>
                  )}

                  {(role === 'user' || role === 'admin') && row.status === 'proposed_change' && (
                    <button onClick={() => handleAcceptChange(row.id)}>Aceptar nuevo horario</button>
                  )}

                  {row.status !== 'cancelled' && (
                    <button onClick={() => handleCancel(row.id)}>Cancelar</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}