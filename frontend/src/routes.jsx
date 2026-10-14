import { Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
<<<<<<< HEAD
=======
import Users from './pages/Users';
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
import User from './pages/User';

const routes = [
  {
    path: '/',
    element: <MainLayout >
      <Outlet />
    </MainLayout>,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
<<<<<<< HEAD
        path: '/user',
=======
        path: '/users',
        element: <Users />,
      },
      {
        path: '/users/new',
        element: <User />,
      },
      {
        path: '/users/:username/edit',
>>>>>>> 9ae67a1a2b7183a18365a450437fb9bf9fb26435
        element: <User />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export default routes;