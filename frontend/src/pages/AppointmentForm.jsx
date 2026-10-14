import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import useAppointment from '../services/useAppointment';
import useUser from '../services/useUser';
import useGlobal from '../services/useGlobal';
import { IconCalendar, IconClock, IconCheck } from '../components/Icons';
import { toast } from 'react-toastify';

// Horarios de atención permitidos por día
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '16:00', '17:00', '18:00',
  '19:00', '20:00'
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { addAppointment, getAppointments } = useAppointment();
  const { getUsers } = useUser();
  const { username, role } = useGlobal();

  const [barbers, setBarbers] = useState([]);
  const [clients, setClients] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  const [customerName, setCustomerName] = useState(role === 'user' ? username : '');
  const [barberUsername, setBarberUsername] = useState(role === 'barber' ? username : '');

  useEffect(() => {
    getUsers()
      .then(users => {
        const barberList = users.filter(u => u.role === 'barber');
        const clientList = users.filter(u => u.role === 'user');
        setBarbers(barberList);
        setClients(clientList);

        if (role === 'barber' && username) {
          setBarberUsername(username);
        } else if (barberList.length > 0 && !barberUsername) {
          setBarberUsername(barberList[0].username);
        }

        if (role === 'user' && username) {
          setCustomerName(username);
        }
      })
      .catch(() => {});

    getAppointments()
      .then(apps => setExistingAppointments(apps))
      .catch(() => {});
  }, [role, username]);

  function formatDateStr(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // Oculta horarios ya tomados o confirmados para ese barbero
  function isSlotOccupied(dateStr, timeStr) {
    if (!barberUsername) return false;
    const fullDate = `${dateStr} ${timeStr}`;
    return existingAppointments.some(app =>
      app.barberUsername === barberUsername &&
      app.status !== 'cancelled' &&
      (app.date === fullDate || app.proposedDate === fullDate)
    );
  }

  // Bloquea días pasados y domingos
  function isPastOrClosedDay(year, month, day) {
    const checkDate = new Date(year, month, day, 23, 59, 59);
    const now = new Date();
    const isSunday = new Date(year, month, day).getDay() === 0;
    return checkDate < now || isSunday;
  }

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
    setSelectedTime('');
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
    setSelectedTime('');
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeek = new Date(currentYear, currentMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < firstDayWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const selectedDateStr = selectedDay ? formatDateStr(currentYear, currentMonth, selectedDay) : '';
  const availableSlots = selectedDateStr
    ? TIME_SLOTS.filter(slot => !isSlotOccupied(selectedDateStr, slot))
    : [];

  async function submitHandler(e) {
    e.preventDefault();
    if (!customerName) {
      toast.warning('Seleccione o ingrese el cliente');
      return;
    }
    if (!barberUsername) {
      toast.warning('Seleccione un barbero');
      return;
    }
    if (!selectedDateStr || !selectedTime) {
      toast.warning('Haga clic en un día del calendario y elija un horario disponible');
      return;
    }

    try {
      await addAppointment({
        customerName,
        barberUsername,
        date: `${selectedDateStr} ${selectedTime}`,
      });
      toast.success(`Turno reservado: ${selectedDateStr} a las ${selectedTime} hs`);
      navigate('/appointments');
    } catch (error) {
      toast.error(error.message || 'No se pudo reservar el turno');
    }
  }

  return (
    <Form
      title="Reservar Turno"
      onSubmit={submitHandler}
      submitLabel="Confirmar Reserva"
      onCancel={() => navigate('/appointments')}
    >
      {/* Campo Cliente */}
      {role === 'user' ? (
        <TextField label="Cliente:" value={customerName} disabled required />
      ) : (
        <SelectField
          label="Cliente:"
          value={customerName}
          onChange={val => setCustomerName(val)}
          options={clients.map(c => ({
            value: c.username,
            label: `${c.displayName} (${c.username})`,
          }))}
          required
        />
      )}

      {/* Campo Barbero */}
      {role === 'barber' ? (
        <TextField label="Barbero:" value={barberUsername} disabled required />
      ) : (
        <SelectField
          label="Barbero:"
          value={barberUsername}
          onChange={val => {
            setBarberUsername(val);
            setSelectedTime('');
          }}
          options={barbers.map(b => ({
            value: b.username,
            label: `${b.displayName} (${b.username})`,
          }))}
          required
        />
      )}

      {/* Calendario Interactivo */}
      <div className="otto-calendar-section">
        <div className="otto-calendar-header">
          <button type="button" className="cal-nav-btn" onClick={prevMonth}>&lt;</button>
          <span className="cal-month-title">
            <IconCalendar size={16} /> {MONTHS[currentMonth]} {currentYear}
          </span>
          <button type="button" className="cal-nav-btn" onClick={nextMonth}>&gt;</button>
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
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedTime('');
                }}
                className={`cal-cell ${isSelected ? 'selected' : ''} ${disabledDay ? 'disabled' : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horarios permitidos al clickear un día */}
      {selectedDay && (
        <div className="otto-slots-section">
          <h4 className="slots-title">
            <IconClock size={16} /> Horarios disponibles para el {selectedDateStr}
          </h4>

          {availableSlots.length === 0 ? (
            <p className="no-slots-msg">
              Todos los horarios de este día ya están ocupados para {barberUsername}.
            </p>
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

      {selectedDateStr && selectedTime && (
        <div className="selected-summary">
          <IconCheck size={16} /> Día y hora elegidos: <strong>{selectedDateStr} — {selectedTime} hs</strong>
        </div>
      )}
    </Form>
  );
}