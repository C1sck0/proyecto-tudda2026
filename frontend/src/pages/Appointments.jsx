import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import useAppointment from '../services/useAppointment';
import useGlobal from '../services/useGlobal';
import { IconCalendar, IconCheck, IconX, IconClock, IconRefresh } from '../components/Icons';

// Horarios de atención de 10:00 a 21:00 hs
const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
  const [allAppointments, setAllAppointments] = useState([]);

  // Estado para el calendario de reprogramación
  const [movingAppointment, setMovingAppointment] = useState(null);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  async function loadList() {
    try {
      const res = await getAppointments();
      setAllAppointments(res);

      // Filtramos de entrada los cancelados para que desaparezcan de la agenda
      const activeOnly = res.filter(app => app.status !== 'cancelled');

      if (role === 'user') {
        setList(activeOnly.filter(app => app.customerName === username));
      } else if (role === 'barber') {
        setList(activeOnly.filter(app => app.barberUsername === username || app.customerName === username));
      } else {
        setList(activeOnly);
      }
    } catch (error) {
      toast.error(error.message || 'No se pudo obtener la agenda');
    }
  }

  useEffect(() => {
    loadList();
  }, [role, username]);

  async function handleConfirm(id) {
    try {
      await confirmAppointment(id);
      toast.success('Turno confirmado');
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function openRescheduleModal(appointment) {
    setMovingAppointment(appointment);
    setSelectedDay(null);
    setSelectedTime('');
  }

  async function submitReschedule() {
    if (!movingAppointment || !selectedDay || !selectedTime) {
      toast.warning('Seleccione un día y un horario disponible');
      return;
    }
    const dateStr = formatDateStr(currentYear, currentMonth, selectedDay);
    const newDate = `${dateStr} ${selectedTime}`;

    try {
      await proposeMove(movingAppointment.id, newDate);
      toast.info(`Propuesta enviada a ${movingAppointment.customerName} para el ${newDate}`);
      setMovingAppointment(null);
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleAcceptChange(id) {
    try {
      await acceptChange(id);
      toast.success('Nuevo horario aceptado y confirmado');
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleCancel(id) {
    const result = await Swal.fire({
      title: '¿Cancelar turno?',
      text: 'El turno se eliminará de la agenda y el horario quedará libre.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#525252',
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

  function formatDateStr(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function isSlotOccupied(barber, dateStr, timeStr) {
    const fullDate = `${dateStr} ${timeStr}`;
    return allAppointments.some(app =>
      app.barberUsername === barber &&
      app.status !== 'cancelled' &&
      (app.date === fullDate || app.proposedDate === fullDate)
    );
  }

  function isPastOrClosedDay(year, month, day) {
    const checkDate = new Date(year, month, day, 23, 59, 59);
    const now = new Date();
    const isSunday = new Date(year, month, day).getDay() === 0;
    return checkDate < now || isSunday;
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeek = new Date(currentYear, currentMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < firstDayWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const selectedDateStr = selectedDay ? formatDateStr(currentYear, currentMonth, selectedDay) : '';
  const availableSlots = (movingAppointment && selectedDateStr)
    ? TIME_SLOTS.filter(slot => !isSlotOccupied(movingAppointment.barberUsername, selectedDateStr, slot))
    : [];

  const statusBadge = (status) => {
    const map = {
      pending: { text: 'Pendiente', cls: 'status-pending' },
      proposed_change: { text: 'Cambio propuesto', cls: 'status-proposed' },
      confirmed: { text: 'Confirmado', cls: 'status-confirmed' },
    };
    const item = map[status] || { text: status, cls: '' };
    return <span className={`status-pill ${item.cls}`}>{item.text}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h4 className="section-title">
          <IconCalendar size={20} /> Agenda de Turnos
        </h4>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/appointments/new')}>
            + Reservar Turno
          </button>
          <button onClick={loadList}>
            <IconRefresh size={14} /> Actualizar
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Barbero</th>
            <th>Fecha y Hora</th>
            <th>Horario Propuesto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem' }}>
                No hay turnos pendientes ni confirmados en la agenda.
              </td>
            </tr>
          ) : (
            list.map(row => (
              <tr key={row.id}>
                <td><strong>{row.customerName}</strong></td>
                <td>{row.barberUsername}</td>
                <td>{row.date}</td>
                <td>{row.proposedDate || '—'}</td>
                <td>{statusBadge(row.status)}</td>
                <td>
                  {(role === 'barber' || role === 'admin') && row.status === 'pending' && (
                    <button className="btn-primary" onClick={() => handleConfirm(row.id)}>
                      <IconCheck size={14} /> Confirmar
                    </button>
                  )}

                  {(role === 'barber' || role === 'admin') && (row.status === 'pending' || row.status === 'confirmed') && (
                    <button onClick={() => openRescheduleModal(row)}>
                      <IconClock size={14} /> Reprogramar
                    </button>
                  )}

                  {(role === 'user' || role === 'admin') && row.status === 'proposed_change' && (
                    <button className="btn-primary" onClick={() => handleAcceptChange(row.id)}>
                      <IconCheck size={14} /> Aceptar horario
                    </button>
                  )}

                  <button className="btn-danger" onClick={() => handleCancel(row.id)}>
                    <IconX size={14} /> Cancelar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Calendario de reprogramación */}
      {movingAppointment && (
        <div className="app-form" style={{ marginTop: '1.75rem' }}>
          <h3>
            Reprogramar turno de {movingAppointment.customerName} (Actual: {movingAppointment.date})
          </h3>

          <div className="otto-calendar-section">
            <div className="otto-calendar-header">
              <button
                type="button"
                className="cal-nav-btn"
                onClick={() => {
                  if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                  else setCurrentMonth(m => m - 1);
                  setSelectedDay(null);
                  setSelectedTime('');
                }}
              >
                &lt;
              </button>
              <span className="cal-month-title">
                <IconCalendar size={16} /> {MONTHS[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                className="cal-nav-btn"
                onClick={() => {
                  if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                  else setCurrentMonth(m => m + 1);
                  setSelectedDay(null);
                  setSelectedTime('');
                }}
              >
                &gt;
              </button>
            </div>

            <div className="otto-calendar-grid">
              {DAYS_SHORT.map(d => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
              {calendarCells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="cal-cell empty" />;
                const disabledDay = isPastOrClosedDay(currentYear, currentMonth, day);
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => { setSelectedDay(day); setSelectedTime(''); }}
                    className={`cal-cell ${isSelected ? 'selected' : ''} ${disabledDay ? 'disabled' : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div className="otto-slots-section">
              <h4 className="slots-title">
                <IconClock size={16} /> Nuevos horarios libres para el {selectedDateStr}
              </h4>
              {availableSlots.length === 0 ? (
                <p className="no-slots-msg">No hay horarios libres en esta fecha.</p>
              ) : (
                <div className="slots-grid">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`slot-btn ${selectedTime === slot ? 'active' : ''}`}
                    >
                      {slot} hs
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-buttons">
            <button type="button" onClick={() => setMovingAppointment(null)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={submitReschedule}>
              <IconCheck size={14} /> Enviar Propuesta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}