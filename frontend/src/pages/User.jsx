import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Form from '../components/Form';
import TextField from '../components/TextField';
import SecretField from '../components/SecretField';
import SelectField from '../components/SelectField';
import { toast } from 'react-toastify';
import useUser from '../services/useUser';

export default function User() {
  const { username } = useParams();
  const { getUser, updateUser, addUser } = useUser();
  const navigate = useNavigate();

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
      .catch(err => toast.error(err?.message || 'Error al cargar los datos del usuario'));
  }, [username]);

  async function submitHandler(e) {
    e.preventDefault();

    if (!data.email.includes('@')) {
      toast.warning('El correo electrónico debe incluir @');
      return;
    }

    try {
      const payload = { ...data };
      if (username && !payload.password) {
        delete payload.password;
      }

      if (username) {
        await updateUser(username, payload);
      } else {
        await addUser(payload);
      }

      toast.success(`Usuario ${username ? 'modificado' : 'registrado'} correctamente`);
      navigate('/users');
    } catch (err) {
      toast.error(err.message || 'Error al guardar el usuario');
    }
  }

  return (
    <Form
      title={username ? `Modificando usuario: ${username}` : "Registrar nuevo usuario"}
      onSubmit={submitHandler}
      submitLabel={username ? "Guardar cambios" : "Registrar"}
      onCancel={() => navigate('/users')}
    >
      <TextField
        label="Nombre de usuario (username):"
        value={data.username}
        onChange={newValue => setData(d => ({ ...d, username: newValue }))}
        required
        disabled={Boolean(username)}
      />
      <TextField
        label="Nombre completo (displayName):"
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
      <SelectField
        label="Rol en la peluquería:"
        value={data.role}
        onChange={newValue => setData(d => ({ ...d, role: newValue }))}
        options={[
          { value: 'user', label: 'Cliente (user)' },
          { value: 'barber', label: 'Barbero (barber)' },
          { value: 'admin', label: 'Administrador (admin)' },
        ]}
        required
      />
    </Form>
  );
}