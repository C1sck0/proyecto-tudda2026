import { Link, useLocation } from 'react-router-dom';

export default function MenuItem({
  to,
  onClick,
  children
}) {
  const location = useLocation();

  return (
    <Link
      to={to || '#'}
      onClick={onClick}
      className={location.pathname === to ? 'selected' : ''}
    >
      {children}
    </Link>
  );
}