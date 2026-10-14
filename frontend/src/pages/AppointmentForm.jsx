import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '../components/Form';
import TextField from '../components/TextField';
import useAppointment from '../services/useAppointment';
import useGlobal from '../services/useGlobal';
import { toast } from 'react-toastify';

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { addAppointment } = useAppointment();
  const { username, role } = useGlobal();

  const [data, setData] = useState({
    customerName: role === 'user' && username ? username : '',
    barberUsername: '',
    date: '',
  });

  async function submitHandler(e) {
    e.preventDefault();
    try {
      await addAppointment(data);
      toast.success('Turno solicitado con éxito (Estado: Pendiente)');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.message || 'No se pudo crear el turno');
    }
  }

  return (
    <Form
      title="Solicitar Nuevo Turno"
      onSubmit={submitHandler}
      submitLabel="Reservar Turno"
      onCancel={() => navigate('/appointments')}
    >
      <TextField
        label="Usuario del Cliente:"
        value={data.customerName}
        onChange={val => setData(d => ({ ...d, customerName: val }))}
        required
        disabled={role === 'user'}
      />
      <TextField
        label="Usuario del Barbero (ej. Simon):"
        value={data.barberUsername}
        onChange={val => setData(d => ({ ...d, barberUsername: val }))}
        placeholder="Nombre de usuario del barbero"
        required
      />
      <TextField
        label="Fecha y Hora (AAAA-MM-DD HH:mm):"
        value={data.date}
        onChange={val => setData(d => ({ ...d, date: val }))}
        placeholder="Ej: 2026-10-25 17:00"
        required
      />
    </Form>
  );
}