import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import SelectField from '../components/SelectField';
import { toast } from 'react-toastify';
import useUser from '../services/useUser';
import useGlobal from '../services/useGlobal';

export default function User() {
  const { username } = useParams();
  const { getUser, updateUser, addUser } = useUser();
  const { role } = useGlobal();
  const navigate = useNavigate();

  const isBarber = role === 'barber';

  const [data, setData] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    if (!username) return;
    getUser(username)
      .then(userData => setData(userData))
      .catch(err => toast.error(err?.message || 'Error al cargar los datos'));
  }, [username]);

  async function submitHandler(e) {
    e.preventDefault();

    if (!data.email.includes('@')) {
      toast.warning('El correo electrónico debe incluir @');
      return;
    }

    try {
      const payload = { ...data };
      if (isBarber) {
        payload.role = 'user';
      }
      if (username && !payload.password) {
        delete payload.password;
      }

      if (username) {
        await updateUser(username, payload);
      } else {
        await addUser(payload);
      }

      toast.success(`${isBarber ? 'Cliente' : 'Usuario'} ${username ? 'modificado' : 'registrado'} correctamente`);
      navigate('/users');
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    }
  }

  return (
    <Form
      title={
        username
          ? `Modificando ${isBarber ? 'cliente' : 'usuario'}: ${username}`
          : isBarber
            ? 'Agregar Nuevo Cliente'
            : 'Agregar Nuevo Usuario'
      }
      onSubmit={submitHandler}
      submitLabel={username ? 'Guardar cambios' : 'Agregar'}
      onCancel={() => navigate('/users')}
    >
      <TextField
        label="Nombre de usuario:"
        value={data.username}
        onChange={newValue => setData(d => ({ ...d, username: newValue }))}
        required
        disabled={Boolean(username)}
      />
      <TextField
        label="Nombre completo:"
        value={data.displayName}
        onChange={newValue => setData(d => ({ ...d, displayName: newValue }))}
        required
      />
      <TextField
        label="Correo electrónico:"
        value={data.email}
        onChange={newValue => setData(d => ({ ...d, email: newValue }))}
        required
      />
      <SecretField
        label="Contraseña:"
        value={data.password}
        onChange={newValue => setData(d => ({ ...d, password: newValue }))}
        required={!username}
      />

      {!isBarber && (
        <SelectField
          label="Rol:"
          value={data.role}
          onChange={newValue => setData(d => ({ ...d, role: newValue }))}
          options={[
            { value: 'user', label: 'Cliente (user)' },
            { value: 'barber', label: 'Barbero (barber)' },
            { value: 'admin', label: 'Administrador (admin)' },
          ]}
          required
        />
      )}
    </Form>
  );
}