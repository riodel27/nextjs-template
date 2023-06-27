import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Homepage', () => {
  it('Displays the NEXT.JS Template text', async () => {
    render(<Home />);
    expect(screen.getByText('NEXT.JS Template')).toBeInTheDocument();
  });
});
