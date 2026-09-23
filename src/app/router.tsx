import { createBrowserRouter } from 'react-router';

import App from '@/App';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlannerPage } from '@/pages/PlannerPage';
import { TripPage } from '@/pages/TripPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <PlannerPage /> },
      { path: 'trips/:id', element: <TripPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
