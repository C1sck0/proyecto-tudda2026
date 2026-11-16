import { useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import useUser from '../services/useUser';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';
import useGlobal from '../services/useGlobal';
import styles from '../styles';

export default function Register({ navigation }) {
  const { registerClient } = useUser();
  const { login } = useLogin();
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
  });

  async function submitHandler() {
    if (!data.username || !data.displayName || !data.email || !data.password) {
      Toast.show({ type: 'error', text1: 'Completá todos los campos' });
      return;
    }
    if (!data.email.includes('@')) {
      Toast.show({ type: 'error', text1: 'El correo electrónico debe incluir @' });
      return;
    }

    setLoading(true);
    try {
      await registerClient(data);
      const res = await login({ username: data.username, password: data.password });
      const sessionData = res.session || res;

      await AsyncStorage.setItem('session', JSON.stringify(sessionData));
      setAuthorization('Bearer ' + sessionData.authorizationToken);
      setUsername(sessionData.username);
      setRole(sessionData.role);

      Toast.show({
        type: 'success',
        text1: '¡Registro exitoso!',
        text2: 'Seleccioná el día y horario de tu turno.',
      });
      navigation.navigate('AppointmentForm');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error al registrarse',
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Crear Cuenta" subtitle="REGISTRO DE CLIENTES">
      <View style={styles.card}>
        <TextField
          label="Nombre de usuario"
          placeholder="Ej: juanperez"
          autoCapitalize="none"
          value={data.username}
          onChangeText={(val) => setData((d) => ({ ...d, username: val }))}
        />
        <TextField
          label="Nombre completo"
          placeholder="Ej: Juan Pérez"
          value={data.displayName}
          onChangeText={(val) => setData((d) => ({ ...d, displayName: val }))}
        />
        <TextField
          label="Correo electrónico"
          placeholder="juan@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={data.email}
          onChangeText={(val) => setData((d) => ({ ...d, email: val }))}
        />
        <TextField
          label="Contraseña"
          placeholder="Mínimo 4 caracteres"
          secureTextEntry
          value={data.password}
          onChangeText={(val) => setData((d) => ({ ...d, password: val }))}
        />

        <View style={{ marginTop: 12 }}>
          <Button
            label={loading ? 'Registrando...' : 'Registrarme y Sacar Turno'}
            onPress={submitHandler}
            disabled={loading}
          />
          <Button
            label="Ya tengo cuenta (Iniciar Sesión)"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </Screen>
  );
}