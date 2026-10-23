import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('exposes its state to assistive tech', () => {
    const { rerender } = render(<Checkbox aria-label='Consent' checked={false} />);

    expect(screen.getByRole('checkbox', { name: 'Consent' })).toHaveAttribute('aria-checked', 'false');

    rerender(<Checkbox checked aria-label='Consent' />);

    expect(screen.getByRole('checkbox', { name: 'Consent' })).toHaveAttribute('aria-checked', 'true');
  });

  it('reports the value the user asked for', () => {
    const onCheckedChange = vi.fn();

    render(<Checkbox aria-label='Consent' checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Consent' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
