import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ChoiceOption } from '../ChoiceGroup.types';

import { ChoiceGroup } from '../ChoiceGroup';

type Way = 'config' | 'link';

const OPTIONS: ChoiceOption<Way>[] = [
  { value: 'link', label: 'Link', description: 'Every server', badge: <span>Best</span> },
  { value: 'config', label: 'Config' }
];

const renderGroup = (value: Way, onChange = vi.fn()) => {
  render(<ChoiceGroup label='Method' options={OPTIONS} value={value} onChange={onChange} />);

  return onChange;
};

describe('ChoiceGroup', () => {
  it('renders a radiogroup named by its label', () => {
    renderGroup('link');

    expect(screen.getByRole('radiogroup', { name: 'Method' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(OPTIONS.length);
  });

  it('checks only the current option', () => {
    renderGroup('config');

    expect(screen.getByRole('radio', { name: 'Config' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Link Best' })).toHaveAttribute('aria-checked', 'false');
  });

  it('reports the picked option', () => {
    const onChange = renderGroup('link');

    fireEvent.click(screen.getByRole('radio', { name: 'Config' }));

    expect(onChange).toHaveBeenCalledWith('config');
  });

  it('names an option by its label and badge, and describes it by its description', () => {
    renderGroup('link');

    const option = screen.getByRole('radio', { name: 'Link Best' });

    expect(option).toHaveAccessibleDescription('Every server');
  });

  it('renders the label as the heading it is asked for', () => {
    render(<ChoiceGroup label='Method' labelAs='h2' options={OPTIONS} value='link' onChange={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Method' })).toBeInTheDocument();
  });
});
