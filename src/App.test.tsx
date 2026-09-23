import { render, screen } from '@testing-library/react';

import App from '@/App';

describe('App', () => {
  it('shows the product heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /eld trip planner/i })).toBeInTheDocument();
  });

  it('renders a themed shadcn button', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /plan a trip/i })).toBeInTheDocument();
  });
});
