import MenuItem from './MenuItem';
<<<<<<< HEAD
=======
import useGlobal from '../services/useGlobal';
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435

export default function Menu({
  visible = true
}) {
<<<<<<< HEAD
=======
  const { role, username } = useGlobal();
  const isAdmin = role === 'admin';

  function logout() {
    localStorage.removeItem('session');
    window.location.href = '/';
  }

>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  return <nav
    style={{
      backgroundColor: 'lightblue',
      display: visible ? '' : 'none',
    }}
  >
    <MenuItem to="/">Inicio</MenuItem>
<<<<<<< HEAD
    <MenuItem to="/login">Login</MenuItem>
    <MenuItem to="/about">Acerca de</MenuItem>
    <MenuItem to="/user">Agregar usuario</MenuItem>
=======
    {!username && <MenuItem to="/login">Login</MenuItem>}
    {isAdmin && <MenuItem to="/users">Usuarios</MenuItem>}
    {username && <MenuItem onClick={logout}>Salir</MenuItem>}
    <MenuItem to="/about">Acerca de</MenuItem>
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  </nav>;
}