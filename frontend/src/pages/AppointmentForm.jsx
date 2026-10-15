import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import useAppointment from '../services/useAppointment';
import useUser from '../services/useUser';
import useGlobal from '../services/useGlobal';
import { IconCalendar, IconClock, IconCheck, IconX } from '../components/Icons';
import { toast } from 'react-toastify';

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

// Marca interna para identificar horarios no laborales / feriados
const BLOCK_MARKER = 'NO_DISPONIBLE';

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { addAppointment, confirmAppointment, cancelAppointment, getAppointments } = useAppointment();
  const { getUsers } = useUser();
  const { username, role } = useGlobal();

  const [barbers, setBarbers] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);

  // Modo exclusivo para Admin y Barbero: false = Agendar Turno, true = Bloquear/Desbloquear Horarios
  const [isBlockMode, setIsBlockMode] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  // Para modo turno normal (1 horario) y para modo bloqueo (múltiples horarios simultáneos)
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBlockTimes, setSelectedBlockTimes] = useState([]);

  const [customerName, setCustomerName] = useState(role === 'user' ? username : '');
  const [barberUsername, setBarberUsername] = useState(role === 'barber' ? username : '');

  async function loadAppointmentsData() {
    try {
      const apps = await getAppointments();
      setExistingAppointments(apps);
    } catch {
      // Silencioso
    }
  }

  useEffect(() => {
    getUsers()
      .then(users => {
        const barberList = users.filter(u => u.role === 'barber');
        const clientList = users.filter(u => u.role === 'user');
        setBarbers(barberList);

        if (role === 'admin') {
          // El Admin PUEDE pedir turnos para sí mismo o para clientes
          const currentAdmin = users.find(u => u.username === username);
          const selfOption = {
            value: username,
            label: `★ Para mí mismo (${currentAdmin ? currentAdmin.displayName : username})`,
          };
          const mappedClients = clientList.map(c => ({
            value: c.username,
            label: `${c.displayName} (${c.username})`,
          }));
          setCustomerOptions([selfOption, ...mappedClients]);
          setCustomerName(username);
        } else if (role === 'barber') {
          // El Barbero solo agenda turnos para clientes ('user')
          const mappedClients = clientList.map(c => ({
            value: c.username,
            label: `${c.displayName} (${c.username})`,
          }));
          setCustomerOptions(mappedClients);
          if (mappedClients.length > 0) {
            setCustomerName(mappedClients[0].value);
          } else {
            setCustomerName('');
          }
        } else {
          // El Cliente ('user') solo saca turno para sí mismo
          setCustomerName(username);
        }

        if (role === 'barber' && username) {
          setBarberUsername(username);
        } else if (barberList.length > 0 && !barberUsername) {
          setBarberUsername(barberList[0].username);
        }
      })
      .catch(() => {});

    loadAppointmentsData();
  }, [role, username]);

  function formatDateStr(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // Busca si hay algún turno o bloqueo activo en esa fecha y hora
  function getSlotRecord(dateStr, timeStr) {
    if (!barberUsername) return null;
    const fullDate = `${dateStr} ${timeStr}`;
    return existingAppointments.find(app =>
      app.barberUsername === barberUsername &&
      app.status !== 'cancelled' &&
      (app.date === fullDate || app.proposedDate === fullDate)
    );
  }

  function isSlotOccupied(dateStr, timeStr) {
    return Boolean(getSlotRecord(dateStr, timeStr));
  }

  function isDayFullyBlockedOrOccupied(year, month, day) {
    if (!barberUsername) return false;
    const dateStr = formatDateStr(year, month, day);
    return TIME_SLOTS.every(slot => isSlotOccupied(dateStr, slot));
  }

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
    setSelectedBlockTimes([]);
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
    setSelectedBlockTimes([]);
  }

  function toggleBlockTime(slot) {
    setSelectedBlockTimes(prev =>
      prev.includes(slot) ? prev.filter(t => t !== slot) : [...prev, slot]
    );
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

  // Obtiene los bloqueos ('NO_DISPONIBLE') de ese día por si quieren desbloquearlos
  const blockedRecordsForSelectedDay = selectedDateStr
    ? TIME_SLOTS
        .map(slot => ({ slot, record: getSlotRecord(selectedDateStr, slot) }))
        .filter(item => item.record && item.record.customerName === BLOCK_MARKER)
    : [];

  // Bloquear todos los horarios libres del día de una vez (Feriado / Día libre)
  async function handleBlockFullDay() {
    if (!selectedDateStr || !barberUsername) {
      toast.warning('Seleccione primero un día en el calendario');
      return;
    }
    if (availableSlots.length === 0) {
      toast.info('Este día ya tiene todos sus horarios bloqueados u ocupados');
      return;
    }

    try {
      for (const slot of availableSlots) {
        const res = await addAppointment({
          customerName: BLOCK_MARKER,
          barberUsername,
          date: `${selectedDateStr} ${slot}`,
        });
        const createdId = res?.newAppointment?._id || res?.newAppointment?.id;
        if (createdId) {
          await confirmAppointment(createdId);
        }
      }
      toast.success(`Día ${selectedDateStr} bloqueado por completo`);
      setSelectedBlockTimes([]);
      await loadAppointmentsData();
    } catch (error) {
      toast.error(error.message || 'Error al bloquear el día');
    }
  }

  // Rehabilitar / Desbloquear todo el día de una vez
  async function handleUnblockFullDay() {
    if (blockedRecordsForSelectedDay.length === 0) return;
    try {
      for (const item of blockedRecordsForSelectedDay) {
        await cancelAppointment(item.record.id);
      }
      toast.success(`Se rehabilitaron los horarios del día ${selectedDateStr}`);
      await loadAppointmentsData();
    } catch (error) {
      toast.error(error.message || 'Error al desbloquear el día');
    }
  }

  // Desbloquear un horario puntual haciendo clic sobre él
  async function handleUnblockSingleSlot(recordId, slot) {
    try {
      await cancelAppointment(recordId);
      toast.info(`Horario ${slot} hs habilitado nuevamente`);
      await loadAppointmentsData();
    } catch (error) {
      toast.error(error.message || 'No se pudo desbloquear el horario');
    }
  }

  async function submitHandler(e) {
    e.preventDefault();
    if (!barberUsername) {
      toast.warning('Seleccione un barbero');
      return;
    }
    if (!selectedDateStr) {
      toast.warning('Seleccione un día en el calendario');
      return;
    }

    // MODO BLOQUEO MÚLTIPLE DE HORARIOS
    if (isBlockMode) {
      if (selectedBlockTimes.length === 0) {
        toast.warning('Seleccione uno o más horarios para bloquear');
        return;
      }
      try {
        for (const slot of selectedBlockTimes) {
          const res = await addAppointment({
            customerName: BLOCK_MARKER,
            barberUsername,
            date: `${selectedDateStr} ${slot}`,
          });
          const createdId = res?.newAppointment?._id || res?.newAppointment?.id;
          if (createdId) {
            await confirmAppointment(createdId);
          }
        }
        toast.success(
          `Se bloquearon ${selectedBlockTimes.length} horario(s) en el día ${selectedDateStr}`
        );
        setSelectedBlockTimes([]);
        await loadAppointmentsData();
      } catch (error) {
        toast.error(error.message || 'No se pudieron bloquear los horarios');
      }
      return;
    }

    // MODO RESERVA DE TURNO NORMAL
    if (!customerName) {
      toast.warning('Seleccione el cliente para el turno');
      return;
    }
    if (!selectedTime) {
      toast.warning('Seleccione un horario disponible');
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
      title={isBlockMode ? 'Administrar Feriados y Horarios No Laborales' : 'Reservar Turno'}
      onSubmit={submitHandler}
      submitLabel={
        isBlockMode
          ? `Bloquear Horarios Seleccionados (${selectedBlockTimes.length})`
          : 'Confirmar Reserva'
      }
      onCancel={() => navigate('/appointments')}
    >
      {/* Selector de modo exclusivo para Barberos y Administradores */}
      {(role === 'barber' || role === 'admin') && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={!isBlockMode ? 'btn-primary' : ''}
            style={{ flex: 1 }}
            onClick={() => {
              setIsBlockMode(false);
              setSelectedBlockTimes([]);
            }}
          >
            <IconCalendar size={16} /> Agendar Turno
          </button>
          <button
            type="button"
            className={isBlockMode ? 'btn-danger' : ''}
            style={{ flex: 1 }}
            onClick={() => {
              setIsBlockMode(true);
              setSelectedTime('');
            }}
          >
            <IconX size={16} /> Bloquear Días / Horarios
          </button>
        </div>
      )}

      {/* Selección de Cliente (Oculto cuando están bloqueando horarios) */}
      {!isBlockMode && (
        role === 'user' ? (
          <TextField label="Cliente:" value={customerName} disabled required />
        ) : (
          <SelectField
            label="Turno para:"
            value={customerName}
            onChange={val => setCustomerName(val)}
            options={customerOptions}
            required
          />
        )
      )}

      {/* Selección de Barbero */}
      {role === 'barber' ? (
        <TextField label="Barbero:" value={barberUsername} disabled required />
      ) : (
        <SelectField
          label="Barbero:"
          value={barberUsername}
          onChange={val => {
            setBarberUsername(val);
            setSelectedTime('');
            setSelectedBlockTimes([]);
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
            const pastOrSunday = isPastOrClosedDay(currentYear, currentMonth, day);
            const fullyBlocked = isDayFullyBlockedOrOccupied(currentYear, currentMonth, day);

            // Para clientes, un día bloqueado no se puede clickear; en modo bloqueo el barbero/admin sí puede clickearlo para desbloquearlo
            const disabledDay = pastOrSunday || (!isBlockMode && fullyBlocked);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                disabled={disabledDay}
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedTime('');
                  setSelectedBlockTimes([]);
                }}
                className={`cal-cell ${isSelected ? 'selected' : ''} ${disabledDay ? 'disabled' : ''}`}
                style={
                  isBlockMode && fullyBlocked && !pastOrSunday
                    ? { borderColor: '#dc2626', color: '#fca5a5' }
                    : undefined
                }
                title={fullyBlocked ? 'Día completo bloqueado / sin cupos' : ''}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grilla de Horarios */}
      {selectedDay && (
        <div className="otto-slots-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '8px' }}>
            <h4 className="slots-title" style={{ margin: 0 }}>
              <IconClock size={16} />
              {isBlockMode
                ? `Seleccioná varios horarios para bloquear el ${selectedDateStr}`
                : `Horarios disponibles para el ${selectedDateStr}`}
            </h4>

            {/* Acciones rápidas de Día Completo en modo bloqueo */}
            {isBlockMode && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {availableSlots.length > 0 && (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleBlockFullDay}
                  >
                    <IconX size={14} /> Bloquear Todo el Día
                  </button>
                )}
                {blockedRecordsForSelectedDay.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUnblockFullDay}
                  >
                    <IconCheck size={14} /> Habilitar Todo el Día
                  </button>
                )}
              </div>
            )}
          </div>

          {!isBlockMode ? (
            // Vista normal para reservar 1 turno (solo muestra horarios libres)
            availableSlots.length === 0 ? (
              <p className="no-slots-msg">
                No quedan horarios disponibles en esta fecha para {barberUsername}.
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
            )
          ) : (
            // Vista Modo Bloqueo (permite marcar varios libres a la vez o desbloquear los ya bloqueados)
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => {
                const record = getSlotRecord(selectedDateStr, slot);
                const isBlockedSlot = record && record.customerName === BLOCK_MARKER;
                const isClientTurn = record && record.customerName !== BLOCK_MARKER;
                const isMarkedToBlock = selectedBlockTimes.includes(slot);

                if (isClientTurn) {
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled
                      className="slot-btn"
                      style={{ opacity: 0.35, cursor: 'not-allowed' }}
                      title={`Reservado por cliente: ${record.customerName}`}
                    >
                      {slot} (Turno)
                    </button>
                  );
                }

                if (isBlockedSlot) {
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleUnblockSingleSlot(record.id, slot)}
                      className="slot-btn btn-danger"
                      title="Clic para volver a habilitar este horario"
                    >
                      {slot} (Liberar)
                    </button>
                  );
                }

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleBlockTime(slot)}
                    className={`slot-btn ${isMarkedToBlock ? 'active' : ''}`}
                  >
                    {slot} hs
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Resumen inferior */}
      {!isBlockMode && selectedDateStr && selectedTime && (
        <div className="selected-summary">
          <IconCheck size={16} />
          <span>
            Turno para <strong>{customerName}</strong> el <strong>{selectedDateStr}</strong> a las <strong>{selectedTime} hs</strong> (Barbero: {barberUsername})
          </span>
        </div>
      )}

      {isBlockMode && selectedDateStr && selectedBlockTimes.length > 0 && (
        <div className="selected-summary">
          <IconCheck size={16} />
          <span>
            Horarios a bloquear el <strong>{selectedDateStr}</strong>: <strong>{selectedBlockTimes.sort().join(', ')} hs</strong>
          </span>
        </div>
      )}
    </Form>
  );
}