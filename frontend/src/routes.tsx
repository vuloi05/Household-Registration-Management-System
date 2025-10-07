import { createBrowserRouter } from 'react-router-dom';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';

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
    path: '*',
    element: <NotFound />,
  },
]);