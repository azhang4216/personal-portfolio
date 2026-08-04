import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Clubhouse portfolio', () => {
  render(<App />);
  expect(screen.getByText(/Angela/i, { selector: 'h1' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /back to top/i })).toBeInTheDocument();
});
