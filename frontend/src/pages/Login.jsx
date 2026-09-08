import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useLogin();
  const { setAuthorization } = useApi();
  const [data, setData] = useState({
    username: '',
    password: '',
  });

  async function submitHandler(e) {
    e.preventDefault();

    try {
      const res = await login(data);
      console.log(res.authorizationToken);
      setAuthorization('Bearer ' + res.authorizationToken);
      alert('Login exitoso');
    } catch (error) {
      alert('Error en el login.');
    }
  }

  function cancelHandler() {
    navigate('/');
  }

  return <Form
    title="Login"
    onSubmit={submitHandler}
    submitLabel="Iniciar sesión"
    onCancel={cancelHandler}
  >
    <TextField
      label="Nombre de usuario:"
      value={data.username}
      onChange={newValue => setData(data => ({ ...data, username: newValue }))}
      required
    />
    <SecretField
      label="Contraseña:"
      value={data.password}
      onChange={newValue => setData(data => ({ ...data, password: newValue }))}
      required
    />
  </Form>;
}