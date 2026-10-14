import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import useUser from '../services/useUser';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';
import useGlobal from '../services/useGlobal';
import { toast } from 'react-toastify';

export default function Register() {
  const navigate = useNavigate();
  const { registerClient } = useUser();
  const { login } = useLogin();
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();
  const [disabled, setDisabled] = useState(false);

  const [data, setData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
  });

  async function submitHandler(e) {
    e.preventDefault();
    if (!data.email.includes('@')) {
      toast.warning('El correo electrónico debe incluir @');
      return;
    }

    setDisabled(true);
    try {
      await registerClient(data);
      const res = await login({ username: data.username, password: data.password });
      const sessionData = res.session || res;

      localStorage.setItem('session', JSON.stringify(sessionData));
      setAuthorization('Bearer ' + sessionData.authorizationToken);
      setUsername(sessionData.username);
      setRole(sessionData.role);

      toast.success('Registro exitoso. Seleccioná el día y horario de tu turno.');
      navigate('/appointments/new');
    } catch (err) {
      toast.error(err.message || 'Error al registrarse');
    }
    setDisabled(false);
  }

  return (
    <Form
      title="Registrarse como Cliente"
      onSubmit={submitHandler}
      submitLabel="Registrarme y Sacar Turno"
      onCancel={() => navigate('/login')}
      disabled={disabled}
    >
      <TextField
        label="Nombre de usuario:"
        value={data.username}
        onChange={val => setData(d => ({ ...d, username: val }))}
        required
        disabled={disabled}
      />
      <TextField
        label="Nombre completo:"
        value={data.displayName}
        onChange={val => setData(d => ({ ...d, displayName: val }))}
        required
        disabled={disabled}
      />
      <TextField
        label="Correo electrónico:"
        value={data.email}
        onChange={val => setData(d => ({ ...d, email: val }))}
        required
        disabled={disabled}
      />
      <SecretField
        label="Contraseña:"
        value={data.password}
        onChange={val => setData(d => ({ ...d, password: val }))}
        required
        disabled={disabled}
      />
    </Form>
  );
}