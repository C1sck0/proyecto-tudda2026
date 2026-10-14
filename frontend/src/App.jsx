import { useEffect } from 'react';
import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
<<<<<<< HEAD

export default function App() {
  const router = createBrowserRouter(routes);
=======
import { toast } from 'react-toastify';
import useApi from './services/useApi';
import useGlobal from './services/useGlobal';

export default function App() {
  const router = createBrowserRouter(routes);
  const { setAuthorization } = useApi();
  const { setUsername, setRole } = useGlobal();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session)
      return;
    
    setAuthorization('Bearer ' + session.authorizationToken);
    setUsername(session.username);
    setRole(session.role);
    toast.success('Sesión iniciada correctamente.');
  }, []);
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435

  return <RouterProvider
    router={router}
  />;
<<<<<<< HEAD
}
=======
}
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
