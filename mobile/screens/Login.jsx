import { useState, useCallback } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';
import useGlobal from '../services/useGlobal';
import Toast from 'react-native-toast-message';
import styles from '../styles';

export default function Login({ navigation }) {
  const { login } = useLogin();
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    username: '',
    password: '',
  });

  const loginHandler = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await login(credentials);
      const sessionData = res.session || res;

      if (!sessionData?.authorizationToken) {
        throw new Error('Credenciales inválidas');
      }

      await AsyncStorage.setItem('session', JSON.stringify(sessionData));
      setAuthorization('Bearer ' + sessionData.authorizationToken);
      setUsername(sessionData.username);
      setRole(sessionData.role);

      Toast.show({
        type: 'success',
        text1: `¡Bienvenido, ${sessionData.username}!`,
      });

      setData({ username: '', password: '' });
      navigation.navigate('Home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error de acceso',
        text2: error.message || 'Usuario o contraseña incorrectos',
      });
    } finally {
      setLoading(false);
    }
  }, [login, setAuthorization, setUsername, setRole, navigation]);

  return (
    <Screen title="Iniciar Sesión" subtitle="BARBERÍA OTTO">
      <View style={styles.card}>
        <TextField
          label="Nombre de usuario"
          placeholder="Ingrese su nombre de usuario"
          autoCapitalize="none"
          value={data.username}
          onChangeText={(text) => setData({ ...data, username: text })}
        />
        <TextField
          label="Contraseña"
          placeholder="Ingrese su contraseña"
          secureTextEntry={true}
          value={data.password}
          onChangeText={(text) => setData({ ...data, password: text })}
        />
        <View style={{ marginTop: 12 }}>
          <Button
            label={loading ? 'Ingresando...' : 'Iniciar sesión'}
            onPress={() => loginHandler(data)}
            disabled={loading}
          />
          <Button
            label="Crear cuenta nueva"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </Screen>
  );
}