import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';
import useGlobal from '../services/useGlobal';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useLogin();
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();
  const [disabled, setDisabled] = useState(false);
  const [data, setData] = useState({
    username: '',
    password: '',
  });

  async function submitHandler(e) {
    e.preventDefault();
    setDisabled(true);

    try {
      const res = await login(data);
      // El backend devuelve { session: { username, role, authorizationToken } }
      const sessionData = res.session || res;

      if (!sessionData || !sessionData.authorizationToken) {
        throw new Error('Credenciales inválidas');
      }

      localStorage.setItem('session', JSON.stringify(sessionData));
      setAuthorization('Bearer ' + sessionData.authorizationToken);
      setUsername(sessionData.username);
      setRole(sessionData.role);
      toast.success(`¡Bienvenido, ${sessionData.username}!`);
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Usuario o contraseña incorrectos.');
    }

    setDisabled(false);
  }

  return (
    <Form
      title="Iniciar Sesión"
      onSubmit={submitHandler}
      submitLabel="Ingresar"
      onCancel={() => navigate('/')}
      disabled={disabled}
    >
      <TextField
        label="Nombre de usuario:"
        value={data.username}
        onChange={newValue => setData(d => ({ ...d, username: newValue }))}
        required
        disabled={disabled}
      />
      <SecretField
        label="Contraseña:"
        value={data.password}
        onChange={newValue => setData(d => ({ ...d, password: newValue }))}
        required
        disabled={disabled}
      />
    </Form>
  );
}