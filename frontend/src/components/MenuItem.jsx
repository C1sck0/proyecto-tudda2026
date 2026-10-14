import { Link, useLocation } from 'react-router-dom';

export default function MenuItem({
  to,
<<<<<<< HEAD
=======
  onClick,
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
  children
}) {
  const location = useLocation();

  return <Link
    to={to}
<<<<<<< HEAD
=======
    onClick={onClick}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
    className={location.pathname === to ? 'selected' : ''}
  >
    {children}
  </Link>
}