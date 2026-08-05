import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the recruiter portfolio and primary sections', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Angela\s*Zhang/i);
  expect(screen.getByRole('heading', { name: /From model training/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Proof, not promises/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Good conversations start here/i })).toBeInTheDocument();
});
