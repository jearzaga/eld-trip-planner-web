import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import App from '@/App';
import { PlannerPage } from '@/pages/PlannerPage';
import { renderWithProviders } from '@/test/render';

describe('App', () => {
  it('renders the application shell and planner route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <App />,
          children: [{ index: true, element: <PlannerPage /> }],
        },
      ],
      { initialEntries: ['/'] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    expect(screen.getByRole('heading', { name: /eld trip planner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^plan trip$/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
