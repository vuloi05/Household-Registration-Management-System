import { createBrowserRouter } from 'react-router-dom';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import AdminLogin from './views/AdminLogin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login/admin',
    element: <AdminLogin />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);