import Screen from '../components/Screen';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function Login() {
  return <Screen
    title="Login"
  >
    <TextField
      label="Nombre de usuario"
      placeholder="Ingrese su nombre de usuario"
    />
    <TextField
      label="Contraseña"
      placeholder="Ingrese su contraseña"
      secureTextEntry={true}
    />
    <Button
      label="Iniciar sesión"
    />
  </Screen>;
}