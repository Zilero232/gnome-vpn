import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '../Switch';

describe('Switch', () => {
  it('exposes its state to assistive tech', () => {
    const { rerender } = render(<Switch aria-label='Block ads' checked={false} />);

    expect(screen.getByRole('switch', { name: 'Block ads' })).toHaveAttribute('aria-checked', 'false');

    rerender(<Switch checked aria-label='Block ads' />);

    expect(screen.getByRole('switch', { name: 'Block ads' })).toHaveAttribute('aria-checked', 'true');
  });

  it('reports the value the user asked for', () => {
    const onCheckedChange = vi.fn();

    render(<Switch aria-label='Block ads' checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Block ads' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('ignores a click while disabled', () => {
    const onCheckedChange = vi.fn();

    render(<Switch disabled aria-label='Block ads' checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Block ads' }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
