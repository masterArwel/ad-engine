import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import MicroAppContainer from '../components/MicroAppContainer';

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'vue-app/*',
        element: <MicroAppContainer />,
      },
      {
        path: 'react-app/*',
        element: <MicroAppContainer />,
      },
    ],
  },
]);

