import { Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import User from './pages/User';
import Users from './pages/Users';
import Appointments from './pages/Appointments';
import AppointmentForm from './pages/AppointmentForm';
import Notifications from './pages/Notifications';

const routes = [
  {
    path: '/',
    element: (
      <MainLayout>
        <Outlet />
      </MainLayout>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/users', element: <Users /> },
      { path: '/users/new', element: <User /> },
      { path: '/users/:username/edit', element: <User /> },
      { path: '/appointments', element: <Appointments /> },
      { path: '/appointments/new', element: <AppointmentForm /> },
      { path: '/notifications', element: <Notifications /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;