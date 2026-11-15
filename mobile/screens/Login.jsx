import { useState, useCallback } from 'react';
import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';
import useGlobal from '../services/useGlobal';
import Toast from 'react-native-toast-message';

export default function Login() {
  const { login } = useLogin();
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();

  const [data, setData] = useState({
    username: '',
    password: '',
  });

  const loginHandler = useCallback(async (data) => {
    const res = await login(data);
    setAuthorization('Bearer ' + res.authorizationToken);
    setUsername(res.username);
    setRole(res.role);
    Toast.show({
      type: 'success',
      text1: 'Sesión iniciada correctamente.'
    });
  }, []);

  return <Screen
    title="Login"
  >
    <TextField
      label="Nombre de usuario"
      placeholder="Ingrese su nombre de usuario"
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
    <Button
      label="Iniciar sesión"
      onPress={() => loginHandler(data)}
    />
  </Screen>;
}