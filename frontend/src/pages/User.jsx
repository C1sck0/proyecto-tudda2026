<<<<<<< HEAD
=======
import { useParams } from 'react-router-dom';
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
import { useState } from 'react';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import SelectField from '../components/SelectField';
<<<<<<< HEAD

export default function User() {
=======
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import useUser from '../services/useUser';
import { useNavigate } from 'react-router-dom';

export default function User() {
  const { username } = useParams();
  const { getUser, updateUser, addUser } = useUser();
  const navigate = useNavigate();

>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  const [data, setData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    role: 'user',
  });

<<<<<<< HEAD
  function submitHandler(e) {
=======
  useEffect(() => {
    getUser(username)
      .then(userData => setData(userData))
      .catch(err => toast.error(err?.message || 'Error al cargar los datos del usuario'));
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function submitHandler(e) {
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    e.preventDefault();

    if (!data.email.includes('@')) {
      alert('El correo electrónico no es válido');
      return;
    }

<<<<<<< HEAD
    console.log(data);
  }

  return <Form
    title="Agregar usuario"
    onSubmit={submitHandler}
=======
    if (username)
      await updateUser(username, data);
    else
      await addUser(data);

    toast.success(`Usuario ${username ? 'modificado' : 'agregado'} correctamente`);
    navigate('/users');
  }

  return <Form
    title={username ? `Modificando usuario: ${username}` : "Agregar usuario"}
    onSubmit={submitHandler}
    submitLabel={username ? "Modificar" : "Agregar"}
    onCancel={() => navigate('/users')}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  >
    <TextField
      label="Nombre de usuario:"
      value={data.username}
      onChange={newValue => setData(data => ({ ...data, username: newValue }))}
      required
    />
    <TextField
      label="Nombre completo:"
      value={data.displayName}
      onChange={newValue => setData(data => ({ ...data, displayName: newValue }))}
      required
    />
    <TextField
      label="Correo electrónico:"
      value={data.email}
      onChange={newValue => setData(data => ({ ...data, email: newValue }))}
      required
    />
    <SecretField
      label="Contraseña:"
      value={data.password}
      onChange={newValue => setData(data => ({ ...data, password: newValue }))}
<<<<<<< HEAD
      required
=======
      required={!username}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    />
    <SelectField
      label="Rol:"
      value={data.role}
      onChange={newValue => setData(data => ({ ...data, role: newValue }))}
      options={[
        { value: 'user', label: 'Usuario' },
        { value: 'admin', label: 'Administrador' },
      ]}
      required
    />
  </Form>;
}