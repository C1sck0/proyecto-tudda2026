import { View, Text } from 'react-native';
import Screen from '../components/Screen';
import styles from '../styles';

export default function About() {
  return (
    <Screen title="Acerca de Nosotros" subtitle="BARBERÍA OTTO — DESDE 2017">
      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
          Sistema de Gestión de Turnos
        </Text>
        <Text style={[styles.text, { marginBottom: 12 }]}>
          Aplicación desarrollada para la gestión integral de turnos de peluquería y
          barbería (TUDS DA 2026).
        </Text>
        <Text style={styles.mutedText}>
          Horarios de atención: Lunes a Sábados de 10:00 a 21:00 hs.
        </Text>
      </View>
    </Screen>
  );
}