import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import useLogin from '../services/useLogin';
import useApi from '../services/useApi';
<<<<<<< HEAD
=======
import useGlobal from '../services/useGlobal';
import { toast } from 'react-toastify';
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435

export default function Login() {
  const navigate = useNavigate();
  const { login } = useLogin();
  const { setAuthorization } = useApi();
<<<<<<< HEAD
=======
  const { setUsername, setRole } = useGlobal();
  const [disabled, setDisabled] = useState(false);
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  const [data, setData] = useState({
    username: '',
    password: '',
  });

  async function submitHandler(e) {
    e.preventDefault();
<<<<<<< HEAD

    try {
      const res = await login(data);
      console.log(res.authorizationToken);
      setAuthorization('Bearer ' + res.authorizationToken);
      alert('Login exitoso');
    } catch (error) {
      alert('Error en el login.');
    }
=======
    setDisabled(true);

    try {
      const res = await login(data);
      localStorage.setItem('session', JSON.stringify(res));
      setAuthorization('Bearer ' + res.authorizationToken);
      setUsername(res.username);
      setRole(res.role);
      toast.success('Sesión iniciada correctamente.');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Error en el login.');
    }

    setDisabled(false);
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  }

  function cancelHandler() {
    navigate('/');
  }

  return <Form
    title="Login"
    onSubmit={submitHandler}
    submitLabel="Iniciar sesión"
    onCancel={cancelHandler}
<<<<<<< HEAD
=======
    disabled={disabled}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  >
    <TextField
      label="Nombre de usuario:"
      value={data.username}
      onChange={newValue => setData(data => ({ ...data, username: newValue }))}
      required
<<<<<<< HEAD
=======
      disabled={disabled}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    />
    <SecretField
      label="Contraseña:"
      value={data.password}
      onChange={newValue => setData(data => ({ ...data, password: newValue }))}
      required
<<<<<<< HEAD
=======
      disabled={disabled}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    />
  </Form>;
}