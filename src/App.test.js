import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the recruiter portfolio and primary sections', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Angela\s*Zhang/i);
  expect(screen.getByRole('heading', { name: /Deeply technical/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Selected Work/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Live from GitHub/i })).toBeInTheDocument();
  expect(
    screen.getByText(/Products, infrastructure, research, and tools, all open source\./i)
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/Built with care, code, and a competitive streak/i)
  ).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Let’s connect/i })).toBeInTheDocument();
  expect(screen.queryByText(/R(?:é|e)sum(?:é|e)/i)).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Schedule a conversation with Angela/i })
  ).toHaveAttribute('href', '#connect');

  const architect = screen.getByRole('button', { name: /AI systems architect/i });
  const customer = screen.getByRole('button', { name: /Customer-facing engineer/i });
  expect(architect).toHaveClass('active');
  fireEvent.click(customer);
  expect(customer).toHaveClass('active');
  expect(customer).toHaveAttribute('aria-pressed', 'true');
});
