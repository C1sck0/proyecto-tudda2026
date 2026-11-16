import { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import Button from '../components/Button';
import useNotification from '../services/useNotification';
import useAppointment from '../services/useAppointment';
import styles from '../styles';

export default function Notifications() {
  const { getNotifications, markAsRead } = useNotification();
  const { acceptChange, cancelAppointment } = useAppointment();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setNotifications(res);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error al cargar notificaciones',
        text2: error.message,
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  async function handleAccept(notif) {
    try {
      await acceptChange(notif.appointmentId);
      await markAsRead(notif._id);
      Toast.show({ type: 'success', text1: 'Cambio de horario aceptado' });
      loadNotifications();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
  }

  async function handleReject(notif) {
    try {
      await cancelAppointment(notif.appointmentId);
      await markAsRead(notif._id);
      Toast.show({ type: 'info', text1: 'Turno cancelado' });
      loadNotifications();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    }
  }

  return (
    <Screen title="Notificaciones">
      <View style={{ marginBottom: 14 }}>
        <Button label="Actualizar" variant="secondary" onPress={loadNotifications} />
      </View>

      {notifications.length === 0 ? (
        <View style={styles.card}>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            No tenés notificaciones pendientes.
          </Text>
        </View>
      ) : (
        notifications.map((n) => (
          <View key={n._id} style={styles.card}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
              {n.title}
            </Text>
            <Text style={[styles.text, { marginBottom: 8 }]}>{n.message}</Text>
            <Text style={[styles.mutedText, { marginBottom: 14 }]}>
              {new Date(n.createdAt).toLocaleString()}
            </Text>

            <Button
              label="Aceptar Cambio"
              onPress={() => handleAccept(n)}
            />
            <Button
              label="Rechazar y Cancelar Turno"
              variant="danger"
              onPress={() => handleReject(n)}
            />
          </View>
        ))
      )}
    </Screen>
  );
}