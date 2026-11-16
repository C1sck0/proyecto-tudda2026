import { View, Text } from 'react-native';
import Screen from '../components/Screen';
import Button from '../components/Button';
import useGlobal from '../services/useGlobal';
import styles from '../styles';

export default function Home({ navigation }) {
  const { username, role } = useGlobal();

  const roleLabels = {
    admin: 'ADMINISTRADOR',
    barber: 'BARBERO',
    user: 'CLIENTE',
  };

  return (
    <Screen title="BARBERÍA OTTO" subtitle="SISTEMA DE GESTIÓN DE TURNOS">
      <View style={styles.card}>
        {!username ? (
          <>
            <Text style={[styles.text, { textAlign: 'center', marginBottom: 18 }]}>
              Reservá tu corte o gestioná tu agenda desde cualquier lugar.
            </Text>
            <Button
              label="Iniciar Sesión"
              onPress={() => navigation.navigate('Login')}
            />
            <Button
              label="Registrarme y Sacar Turno"
              variant="secondary"
              onPress={() => navigation.navigate('Register')}
            />
          </>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { textAlign: 'center' }]}>
              Hola, {username}
            </Text>
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>
                  {roleLabels[role] || role}
                </Text>
              </View>
            </View>

            <Button
              label="Agenda de Turnos"
              onPress={() => navigation.navigate('Appointments')}
            />
            <Button
              label={
                role === 'admin' || role === 'barber'
                  ? 'Reservar Turno / Bloquear Horarios'
                  : 'Reservar Turno'
              }
              variant="secondary"
              onPress={() => navigation.navigate('AppointmentForm')}
            />

            {(role === 'user' || role === 'admin') && (
              <Button
                label="Mis Notificaciones"
                variant="secondary"
                onPress={() => navigation.navigate('Notifications')}
              />
            )}

            {(role === 'admin' || role === 'barber') && (
              <Button
                label={role === 'barber' ? 'Mis Clientes' : 'Gestión de Usuarios'}
                variant="secondary"
                onPress={() => navigation.navigate('Users')}
              />
            )}
          </>
        )}
      </View>
    </Screen>
  );
}