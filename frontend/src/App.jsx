import { useEffect } from 'react';
import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import useApi from './services/useApi';
import useGlobal from './services/useGlobal';

const router = createBrowserRouter(routes);

export default function App() {
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();

  useEffect(() => {
    const raw = localStorage.getItem('session');
    if (!raw) return;

    try {
      const session = JSON.parse(raw);
      if (session?.authorizationToken) {
        setAuthorization('Bearer ' + session.authorizationToken);
        setUsername(session.username);
        setRole(session.role);
      }
    } catch (e) {
      console.error('Error al restaurar la sesión:', e);
    }
  }, []);

  return <RouterProvider router={router} />;
}