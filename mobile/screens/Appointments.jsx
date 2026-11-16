import { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, Platform, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import Button from '../components/Button';
import useAppointment from '../services/useAppointment';
import useGlobal from '../services/useGlobal';
import styles from '../styles';

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00',
];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const BLOCK_MARKER = 'NO_DISPONIBLE';

export default function Appointments({ navigation }) {
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

  // Estado para reprogramación
  const [movingAppointment, setMovingAppointment] = useState(null);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  const loadList = useCallback(async () => {
    try {
      const res = await getAppointments();
      setAllAppointments(res);

      const realActive = res.filter(
        (app) => app.status !== 'cancelled' && app.customerName !== BLOCK_MARKER
      );

      if (role === 'user') {
        setList(realActive.filter((app) => app.customerName === username));
      } else if (role === 'barber') {
        setList(realActive.filter((app) => app.barberUsername === username));
      } else {
        setList(realActive);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al cargar agenda',
        text2: error.message,
      });
    }
  }, [role, username]);

  useFocusEffect(
    useCallback(() => {
      loadList();
    }, [loadList])
  );

  async function handleConfirm(id) {
    try {
      await confirmAppointment(id);
      Toast.show({ type: 'success', text1: 'Turno confirmado' });
      loadList();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    }
  }

  function openReschedule(appointment) {
    setMovingAppointment(appointment);
    setSelectedDay(null);
    setSelectedTime('');
  }

  async function submitReschedule() {
    if (!movingAppointment || !selectedDay || !selectedTime) {
      Toast.show({ type: 'info', text1: 'Seleccioná un día y un horario libre' });
      return;
    }
    const dateStr = formatDateStr(currentYear, currentMonth, selectedDay);
    const newDate = `${dateStr} ${selectedTime}`;

    try {
      await proposeMove(movingAppointment.id, newDate);
      Toast.show({
        type: 'success',
        text1: 'Propuesta enviada',
        text2: `Se propuso a ${movingAppointment.customerName} el ${newDate}`,
      });
      setMovingAppointment(null);
      loadList();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    }
  }

  async function handleAcceptChange(id) {
    try {
      await acceptChange(id);
      Toast.show({ type: 'success', text1: 'Nuevo horario aceptado y confirmado' });
      loadList();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    }
  }

  async function executeCancel(id) {
    try {
      await cancelAppointment(id);
      Toast.show({ type: 'success', text1: 'Turno cancelado' });
      loadList();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    }
  }

  function handleCancel(id) {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Cancelar turno? El turno se eliminará de la agenda y el horario quedará libre.')) {
        executeCancel(id);
      }
      return;
    }

    Alert.alert(
      '¿Cancelar turno?',
      'El turno se eliminará de la agenda y el horario quedará libre.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => executeCancel(id),
        },
      ]
    );
  }

  function formatDateStr(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function isSlotOccupied(barber, dateStr, timeStr) {
    const fullDate = `${dateStr} ${timeStr}`;
    return allAppointments.some(
      (app) =>
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

  const selectedDateStr = selectedDay
    ? formatDateStr(currentYear, currentMonth, selectedDay)
    : '';
  const availableSlots =
    movingAppointment && selectedDateStr
      ? TIME_SLOTS.filter(
          (slot) => !isSlotOccupied(movingAppointment.barberUsername, selectedDateStr, slot)
        )
      : [];

  function renderStatusBadge(status) {
    const map = {
      pending: { text: 'PENDIENTE', bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' },
      proposed_change: { text: 'CAMBIO PROPUESTO', bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' },
      confirmed: { text: 'CONFIRMADO', bg: '#ffffff', color: '#09090b' },
    };
    const item = map[status] || { text: status, bg: '#27272a', color: '#e4e4e7' };
    return (
      <View style={[localStyles.statusPill, { backgroundColor: item.bg }]}>
        <Text style={[localStyles.statusText, { color: item.color }]}>{item.text}</Text>
      </View>
    );
  }

  return (
    <Screen title="Agenda de Turnos">
      <View style={{ marginBottom: 14 }}>
        <Button
          label={
            role === 'barber' || role === 'admin'
              ? '+ Turno / Bloquear Horarios'
              : '+ Reservar Turno'
          }
          onPress={() => navigation.navigate('AppointmentForm')}
        />
        <Button label="Actualizar Agenda" variant="secondary" onPress={loadList} />
      </View>

      {list.length === 0 ? (
        <View style={styles.card}>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            No hay turnos activos en la agenda.
          </Text>
        </View>
      ) : (
        list.map((row) => (
          <View key={row.id} style={styles.card}>
            <View style={localStyles.cardTop}>
              <Text style={localStyles.customerTitle}>{row.customerName}</Text>
              {renderStatusBadge(row.status)}
            </View>

            <Text style={styles.mutedText}>
              Barbero: <Text style={{ color: '#ffffff', fontWeight: '600' }}>{row.barberUsername}</Text>
            </Text>
            <Text style={[styles.text, { marginTop: 4 }]}>
              Fecha y Hora: <Text style={{ fontWeight: '700' }}>{row.date} hs</Text>
            </Text>

            {row.proposedDate ? (
              <Text style={{ color: '#93c5fd', fontSize: 13, marginTop: 4, fontWeight: '600' }}>
                Horario Propuesto: {row.proposedDate} hs
              </Text>
            ) : null}

            <View style={{ marginTop: 12 }}>
              {(role === 'barber' || role === 'admin') && row.status === 'pending' && (
                <Button label="Confirmar Turno" onPress={() => handleConfirm(row.id)} />
              )}

              {(role === 'barber' || role === 'admin') &&
                (row.status === 'pending' || row.status === 'confirmed') && (
                  <Button
                    label="Reprogramar"
                    variant="secondary"
                    onPress={() => openReschedule(row)}
                  />
                )}

              {(role === 'user' || role === 'admin') && row.status === 'proposed_change' && (
                <Button
                  label="Aceptar Nuevo Horario"
                  onPress={() => handleAcceptChange(row.id)}
                />
              )}

              <Button
                label="Cancelar Turno"
                variant="danger"
                onPress={() => handleCancel(row.id)}
              />
            </View>
          </View>
        ))
      )}

      {/* Panel de Reprogramación */}
      {movingAppointment && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Reprogramar a {movingAppointment.customerName}
          </Text>
          <Text style={[styles.mutedText, { marginBottom: 12 }]}>
            Turno actual: {movingAppointment.date} hs
          </Text>

          <View style={localStyles.calHeader}>
            <Pressable
              style={localStyles.calNavBtn}
              onPress={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11);
                  setCurrentYear((y) => y - 1);
                } else {
                  setCurrentMonth((m) => m - 1);
                }
                setSelectedDay(null);
                setSelectedTime('');
              }}
            >
              <Text style={localStyles.calNavText}>{'<'}</Text>
            </Pressable>

            <Text style={localStyles.calMonthTitle}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>

            <Pressable
              style={localStyles.calNavBtn}
              onPress={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0);
                  setCurrentYear((y) => y + 1);
                } else {
                  setCurrentMonth((m) => m + 1);
                }
                setSelectedDay(null);
                setSelectedTime('');
              }}
            >
              <Text style={localStyles.calNavText}>{'>'}</Text>
            </Pressable>
          </View>

          <View style={localStyles.calGrid}>
            {DAYS_SHORT.map((d) => (
              <Text key={d} style={localStyles.calDayName}>
                {d}
              </Text>
            ))}
            {calendarCells.map((day, idx) => {
              if (!day) return <View key={`empty-${idx}`} style={localStyles.calCellEmpty} />;
              const disabledDay = isPastOrClosedDay(currentYear, currentMonth, day);
              const isSelected = selectedDay === day;
              return (
                <Pressable
                  key={day}
                  disabled={disabledDay}
                  onPress={() => {
                    setSelectedDay(day);
                    setSelectedTime('');
                  }}
                  style={[
                    localStyles.calCell,
                    isSelected && localStyles.calCellSelected,
                    disabledDay && localStyles.calCellDisabled,
                  ]}
                >
                  <Text
                    style={[
                      localStyles.calCellText,
                      isSelected && { color: '#09090b', fontWeight: '800' },
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedDay && (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.fieldLabel}>
                Horarios libres para el {selectedDateStr}:
              </Text>
              {availableSlots.length === 0 ? (
                <Text style={styles.mutedText}>No hay horarios libres en esta fecha.</Text>
              ) : (
                <View style={localStyles.slotsGrid}>
                  {availableSlots.map((slot) => (
                    <Pressable
                      key={slot}
                      onPress={() => setSelectedTime(slot)}
                      style={[
                        localStyles.slotBtn,
                        selectedTime === slot && localStyles.slotBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          localStyles.slotText,
                          selectedTime === slot && { color: '#09090b', fontWeight: '800' },
                        ]}
                      >
                        {slot} hs
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ marginTop: 14 }}>
            <Button label="Enviar Propuesta" onPress={submitReschedule} />
            <Button
              label="Cerrar"
              variant="secondary"
              onPress={() => setMovingAppointment(null)}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calNavBtn: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  calNavText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  calMonthTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calDayName: {
    width: '14.28%',
    textAlign: 'center',
    color: '#71717a',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  calCellEmpty: {
    width: '14.28%',
    height: 38,
  },
  calCell: {
    width: '13.28%',
    marginHorizontal: '0.5%',
    marginVertical: 2,
    height: 38,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  calCellDisabled: {
    opacity: 0.25,
  },
  calCellText: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  slotBtn: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  slotBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  slotText: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
  },
});