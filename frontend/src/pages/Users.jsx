import { useState, useEffect } from 'react';
import useUser from '../services/useUser';
import useGlobal from '../services/useGlobal';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconUsers, IconRefresh } from '../components/Icons';

export default function Users() {
  const navigate = useNavigate();
  const { getUsers, deleteUser } = useUser();
  const { role } = useGlobal();
  const [list, setList] = useState([]);

  const isBarber = role === 'barber';

  async function loadList() {
    try {
      const res = await getUsers();
      // Si es barbero, solo mostramos a los clientes (rol 'user')
      if (isBarber) {
        setList(res.filter(u => u.role === 'user'));
      } else {
        setList(res);
      }
    } catch (err) {
      toast.error(err.message || 'Error al cargar la lista');
    }
  }

  useEffect(() => {
    loadList();
  }, [role]);

  const eliminarUsuario = async (username) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${username}?`,
      text: 'Esta acción no se podrá revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111111',
      cancelButtonColor: '#525252',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(username);
        toast.success('Eliminado correctamente');
        await loadList();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h4 className="section-title">
          <IconUsers size={20} /> {isBarber ? 'Mis Clientes' : 'Gestión de Usuarios'}
        </h4>

        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/users/new')}>
            {isBarber ? '+ Agregar Cliente' : '+ Agregar Usuario'}
          </button>
          <button onClick={() => loadList()}>
            <IconRefresh size={14} /> Actualizar
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre de usuario</th>
            <th>Nombre completo</th>
            <th>Email</th>
            {!isBarber && <th>Rol</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={isBarber ? 4 : 5} style={{ textAlign: 'center', padding: '1.5rem' }}>
                No hay registros para mostrar.
              </td>
            </tr>
          ) : (
            list.map(row => (
              <tr key={row.username}>
                <td><strong>{row.username}</strong></td>
                <td>{row.displayName}</td>
                <td>{row.email}</td>
                {!isBarber && <td>{row.role}</td>}
                <td>
                  <button onClick={() => navigate(`/users/${row.username}/edit`)}>
                    Modificar
                  </button>
                  <button className="btn-danger" onClick={() => eliminarUsuario(row.username)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}