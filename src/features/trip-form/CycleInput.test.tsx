import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CycleInput } from '@/features/trip-form/CycleInput';
import { renderWithProviders } from '@/test/render';

function CycleInputHarness() {
  const [value, setValue] = useState(20);
  return <CycleInput value={value} onChange={setValue} />;
}

describe('CycleInput', () => {
  it('keeps the numeric value and available hours in sync', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CycleInputHarness />);

    const input = screen.getByLabelText(/current cycle used/i);
    expect(input).toHaveValue(20);
    expect(screen.getByText('50 h available')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, '22.25');

    expect(input).toHaveValue(22.25);
    expect(screen.getByText('47.75 h available')).toBeInTheDocument();
  });
});
