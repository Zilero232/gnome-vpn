import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { StepListItem } from '../StepList.types';

import { StepList } from '../StepList';

const STEPS: StepListItem[] = [
  { key: 'copy', title: 'Copy', children: <p>Press copy</p> },
  { key: 'paste', title: 'Paste', aside: <span>2 of 3</span> },
  { key: 'connect', title: 'Connect' }
];

describe('StepList', () => {
  it('renders one list item per step, in order', () => {
    render(<StepList steps={STEPS} />);

    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(STEPS.length);
    items.forEach((item, index) => expect(within(item).getByRole('heading')).toHaveTextContent(String(STEPS[index].title)));
  });

  it('numbers the steps from one', () => {
    render(<StepList steps={STEPS} />);

    screen.getAllByRole('listitem').forEach((item, index) => expect(item).toHaveTextContent(String(index + 1)));
  });

  it('renders the content and the aside of a step', () => {
    render(<StepList steps={STEPS} />);

    expect(screen.getByText('Press copy')).toBeInTheDocument();
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
  });
});
