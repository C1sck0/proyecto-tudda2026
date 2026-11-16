import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import useAppointment from '../services/useAppointment';
import useUser from '../services/useUser';
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

export default function AppointmentForm({ navigation }) {
  const { addAppointment, confirmAppointment, cancelAppointment, getAppointments } =
    useAppointment();
  const { getUsers } = useUser();
  const { username, role } = useGlobal();

  const [barbers, setBarbers] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [isBlockMode, setIsBlockMode] = useState(false);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const [selectedTime, setSelectedTime] = useState('');
  const [selectedBlockTimes, setSelectedBlockTimes] = useState([]);

  const [customerName, setCustomerName] = useState(role === 'user' ? username : '');
  const [barberUsername, setBarberUsername] = useState(role === 'barber' ? username : '');

  const loadAppointmentsData = useCallback(async () => {
    try {
      const apps = await getAppointments();
      setExistingAppointments(apps);
    } catch {
      // Silencioso
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUsers()
        .then((users) => {
          const barberList = users.filter((u) => u.role === 'barber');
          const clientList = users.filter((u) => u.role === 'user');
          setBarbers(barberList);

          if (role === 'admin') {
            const currentAdmin = users.find((u) => u.username === username);
            const selfOption = {
              value: username,
              label: `★ Para mí (${currentAdmin ? currentAdmin.displayName : username})`,
            };
            const mappedClients = clientList.map((c) => ({
              value: c.username,
              label: `${c.displayName} (${c.username})`,
            }));
            setCustomerOptions([selfOption, ...mappedClients]);
            setCustomerName((prev) => prev || username);
          } else if (role === 'barber') {
            const mappedClients = clientList.map((c) => ({
              value: c.username,
              label: `${c.displayName} (${c.username})`,
            }));
            setCustomerOptions(mappedClients);
            if (mappedClients.length > 0) {
              setCustomerName((prev) => prev || mappedClients[0].value);
            }
          } else {
            setCustomerName(username);
          }

          if (role === 'barber' && username) {
            setBarberUsername(username);
          } else if (barberList.length > 0) {
            setBarberUsername((prev) => prev || barberList[0].username);
          }
        })
        .catch(() => {});

      loadAppointmentsData();
    }, [role, username, loadAppointmentsData])
  );

  function formatDateStr(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function getSlotRecord(dateStr, timeStr) {
    if (!barberUsername) return null;
    const fullDate = `${dateStr} ${timeStr}`;
    return existingAppointments.find(
      (app) =>
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
    return TIME_SLOTS.every((slot) => isSlotOccupied(dateStr, slot));
  }

  function isPastOrClosedDay(year, month, day) {
    const checkDate = new Date(year, month, day, 23, 59, 59);
    const now = new Date();
    const isSunday = new Date(year, month, day).getDay() === 0;
    return checkDate < now || isSunday;
  }

  function toggleBlockTime(slot) {
    setSelectedBlockTimes((prev) =>
      prev.includes(slot) ? prev.filter((t) => t !== slot) : [...prev, slot]
    );
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeek = new Date(currentYear, currentMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < firstDayWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const selectedDateStr = selectedDay
    ? formatDateStr(currentYear, currentMonth, selectedDay)
    : '';
  const availableSlots = selectedDateStr
    ? TIME_SLOTS.filter((slot) => !isSlotOccupied(selectedDateStr, slot))
    : [];

  const blockedRecordsForSelectedDay = selectedDateStr
    ? TIME_SLOTS.map((slot) => ({ slot, record: getSlotRecord(selectedDateStr, slot) })).filter(
        (item) => item.record && item.record.customerName === BLOCK_MARKER
      )
    : [];

  async function handleBlockFullDay() {
    if (!selectedDateStr || !barberUsername) return;
    if (availableSlots.length === 0) {
      Toast.show({ type: 'info', text1: 'Este día ya está completamente ocupado o bloqueado' });
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
        if (createdId) await confirmAppointment(createdId);
      }
      Toast.show({ type: 'success', text1: `Día ${selectedDateStr} bloqueado por completo` });
      setSelectedBlockTimes([]);
      await loadAppointmentsData();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al bloquear', text2: error.message });
    }
  }

  async function handleUnblockFullDay() {
    if (blockedRecordsForSelectedDay.length === 0) return;
    try {
      for (const item of blockedRecordsForSelectedDay) {
        await cancelAppointment(item.record.id);
      }
      Toast.show({ type: 'success', text1: `Horarios del ${selectedDateStr} habilitados` });
      await loadAppointmentsData();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al habilitar', text2: error.message });
    }
  }

  async function handleUnblockSingleSlot(recordId, slot) {
    try {
      await cancelAppointment(recordId);
      Toast.show({ type: 'info', text1: `Horario ${slot} hs habilitado nuevamente` });
      await loadAppointmentsData();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
  }

  async function submitHandler() {
    if (!barberUsername) {
      Toast.show({ type: 'error', text1: 'Seleccioná un barbero' });
      return;
    }
    if (!selectedDateStr) {
      Toast.show({ type: 'error', text1: 'Seleccioná un día en el calendario' });
      return;
    }

    if (isBlockMode) {
      if (selectedBlockTimes.length === 0) {
        Toast.show({ type: 'error', text1: 'Seleccioná uno o más horarios para bloquear' });
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
          if (createdId) await confirmAppointment(createdId);
        }
        Toast.show({
          type: 'success',
          text1: `${selectedBlockTimes.length} horario(s) bloqueados`,
        });
        setSelectedBlockTimes([]);
        await loadAppointmentsData();
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message });
      }
      return;
    }

    if (!customerName) {
      Toast.show({ type: 'error', text1: 'Seleccioná el cliente para el turno' });
      return;
    }
    if (!selectedTime) {
      Toast.show({ type: 'error', text1: 'Seleccioná un horario disponible' });
      return;
    }

    try {
      await addAppointment({
        customerName,
        barberUsername,
        date: `${selectedDateStr} ${selectedTime}`,
      });
      Toast.show({
        type: 'success',
        text1: 'Turno reservado',
        text2: `${selectedDateStr} a las ${selectedTime} hs`,
      });
      navigation.navigate('Appointments');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'No se pudo reservar', text2: error.message });
    }
  }

  return (
    <Screen title={isBlockMode ? 'Bloquear Horarios' : 'Reservar Turno'}>
      <View style={styles.card}>
        {/* Selector de modo para Barbero y Admin */}
        {(role === 'barber' || role === 'admin') && (
          <View style={{ marginBottom: 14 }}>
            <Button
              label="Agendar Turno"
              variant={!isBlockMode ? 'primary' : 'secondary'}
              onPress={() => {
                setIsBlockMode(false);
                setSelectedBlockTimes([]);
              }}
            />
            <Button
              label="Bloquear Días / Horarios"
              variant={isBlockMode ? 'danger' : 'secondary'}
              onPress={() => {
                setIsBlockMode(true);
                setSelectedTime('');
              }}
            />
          </View>
        )}

        {/* Selección de Cliente */}
        {!isBlockMode &&
          (role === 'user' ? (
            <TextField label="Cliente" value={customerName} editable={false} />
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Turno para:</Text>
              <View style={localStyles.chipsWrap}>
                {customerOptions.map((opt) => {
                  const active = customerName === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setCustomerName(opt.value)}
                      style={[localStyles.chip, active && localStyles.chipActive]}
                    >
                      <Text style={[localStyles.chipText, active && localStyles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

        {/* Selección de Barbero */}
        {role === 'barber' ? (
          <TextField label="Barbero" value={barberUsername} editable={false} />
        ) : (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Barbero:</Text>
            <View style={localStyles.chipsWrap}>
              {barbers.map((b) => {
                const active = barberUsername === b.username;
                return (
                  <Pressable
                    key={b.username}
                    onPress={() => {
                      setBarberUsername(b.username);
                      setSelectedTime('');
                      setSelectedBlockTimes([]);
                    }}
                    style={[localStyles.chip, active && localStyles.chipActive]}
                  >
                    <Text style={[localStyles.chipText, active && localStyles.chipTextActive]}>
                      {b.displayName} ({b.username})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Calendario Interactivo */}
        <View style={localStyles.calBox}>
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
                setSelectedBlockTimes([]);
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
                setSelectedBlockTimes([]);
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
              const pastOrSunday = isPastOrClosedDay(currentYear, currentMonth, day);
              const fullyBlocked = isDayFullyBlockedOrOccupied(currentYear, currentMonth, day);
              const disabledDay = pastOrSunday || (!isBlockMode && fullyBlocked);
              const isSelected = selectedDay === day;

              return (
                <Pressable
                  key={day}
                  disabled={disabledDay}
                  onPress={() => {
                    setSelectedDay(day);
                    setSelectedTime('');
                    setSelectedBlockTimes([]);
                  }}
                  style={[
                    localStyles.calCell,
                    isSelected && localStyles.calCellSelected,
                    disabledDay && localStyles.calCellDisabled,
                    isBlockMode && fullyBlocked && !pastOrSunday && { borderColor: '#dc2626' },
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
        </View>

        {/* Grilla de Horarios */}
        {selectedDay && (
          <View style={localStyles.calBox}>
            <Text style={[styles.fieldLabel, { marginBottom: 10 }]}>
              {isBlockMode
                ? `Bloqueo de horarios para el ${selectedDateStr}:`
                : `Horarios disponibles el ${selectedDateStr}:`}
            </Text>

            {isBlockMode && (
              <View style={{ marginBottom: 10 }}>
                {availableSlots.length > 0 && (
                  <Button
                    label="Bloquear Todo el Día"
                    variant="danger"
                    onPress={handleBlockFullDay}
                  />
                )}
                {blockedRecordsForSelectedDay.length > 0 && (
                  <Button
                    label="Habilitar Todo el Día"
                    variant="secondary"
                    onPress={handleUnblockFullDay}
                  />
                )}
              </View>
            )}

            {!isBlockMode ? (
              availableSlots.length === 0 ? (
                <Text style={styles.mutedText}>
                  No quedan horarios disponibles en esta fecha para {barberUsername}.
                </Text>
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
              )
            ) : (
              <View style={localStyles.slotsGrid}>
                {TIME_SLOTS.map((slot) => {
                  const record = getSlotRecord(selectedDateStr, slot);
                  const isBlockedSlot = record && record.customerName === BLOCK_MARKER;
                  const isClientTurn = record && record.customerName !== BLOCK_MARKER;
                  const isMarkedToBlock = selectedBlockTimes.includes(slot);

                  if (isClientTurn) {
                    return (
                      <View key={slot} style={[localStyles.slotBtn, { opacity: 0.35 }]}>
                        <Text style={localStyles.slotText}>{slot} (Turno)</Text>
                      </View>
                    );
                  }

                  if (isBlockedSlot) {
                    return (
                      <Pressable
                        key={slot}
                        onPress={() => handleUnblockSingleSlot(record.id, slot)}
                        style={[localStyles.slotBtn, localStyles.slotBtnDanger]}
                      >
                        <Text style={{ color: '#fca5a5', fontSize: 13, fontWeight: '700' }}>
                          {slot} (Liberar)
                        </Text>
                      </Pressable>
                    );
                  }

                  return (
                    <Pressable
                      key={slot}
                      onPress={() => toggleBlockTime(slot)}
                      style={[
                        localStyles.slotBtn,
                        isMarkedToBlock && localStyles.slotBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          localStyles.slotText,
                          isMarkedToBlock && { color: '#09090b', fontWeight: '800' },
                        ]}
                      >
                        {slot} hs
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Resumen inferior */}
        {!isBlockMode && selectedDateStr && selectedTime ? (
          <View style={localStyles.summaryBox}>
            <Text style={styles.text}>
              Turno para <Text style={{ fontWeight: '700' }}>{customerName}</Text> el{' '}
              <Text style={{ fontWeight: '700' }}>{selectedDateStr}</Text> a las{' '}
              <Text style={{ fontWeight: '700' }}>{selectedTime} hs</Text> (Barbero:{' '}
              {barberUsername})
            </Text>
          </View>
        ) : null}

        {isBlockMode && selectedDateStr && selectedBlockTimes.length > 0 ? (
          <View style={localStyles.summaryBox}>
            <Text style={styles.text}>
              Horarios a bloquear el <Text style={{ fontWeight: '700' }}>{selectedDateStr}</Text>:{' '}
              <Text style={{ fontWeight: '700' }}>{selectedBlockTimes.sort().join(', ')} hs</Text>
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 14 }}>
          <Button
            label={
              isBlockMode
                ? `Bloquear Horarios (${selectedBlockTimes.length})`
                : 'Confirmar Reserva'
            }
            onPress={submitHandler}
          />
          <Button
            label="Cancelar"
            variant="secondary"
            onPress={() => navigation.navigate('Appointments')}
          />
        </View>
      </View>
    </Screen>
  );
}

const localStyles = StyleSheet.create({
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  chipText: {
    color: '#e4e4e7',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#09090b',
    fontWeight: '800',
  },
  calBox: {
    marginTop: 12,
    backgroundColor: '#0c0c0e',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    padding: 12,
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
  slotBtnDanger: {
    backgroundColor: 'rgba(127, 29, 29, 0.35)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  slotText: {
    color: '#f4f4f5',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderLeftWidth: 4,
    borderLeftColor: '#ffffff',
    borderRadius: 8,
  },
});