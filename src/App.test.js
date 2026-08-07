import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  expect(screen.getByRole('banner')).toHaveClass('is-visible');
  expect(screen.getByRole('banner')).not.toHaveClass('is-hidden');
  expect(screen.getByRole('combobox', { name: /Time zone/i })).toHaveValue(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const architect = screen.getByRole('button', { name: /AI systems architect/i });
  const customer = screen.getByRole('button', { name: /Customer-facing engineer/i });
  expect(architect).toHaveClass('active');
  fireEvent.click(customer);
  expect(customer).toHaveClass('active');
  expect(customer).toHaveAttribute('aria-pressed', 'true');
});

test('restores a direct section link after the React app mounts', async () => {
  const originalScrollTo = window.scrollTo;
  const scrollTo = jest.fn();
  window.scrollTo = scrollTo;
  window.history.replaceState({}, '', '/#connect');

  const { unmount } = render(<App />);
  const connect = document.getElementById('connect');
  const targetRect = jest.spyOn(connect, 'getBoundingClientRect').mockReturnValue({
    top: 5000,
    right: 0,
    bottom: 6000,
    left: 0,
    width: 1000,
    height: 1000,
    x: 0,
    y: 5000,
    toJSON: () => {},
  });

  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  await waitFor(() => {
    expect(scrollTo.mock.calls.some(([options]) => options.top > 0)).toBe(true);
  }, { timeout: 1500 });

  unmount();
  targetRect.mockRestore();
  window.history.replaceState({}, '', '/');
  window.scrollTo = originalScrollTo;
});
