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

  const architect = screen.getByRole('button', { name: /AI systems architect/i });
  const customer = screen.getByRole('button', { name: /Customer-facing engineer/i });
  expect(architect).toHaveClass('active');
  fireEvent.click(customer);
  expect(customer).toHaveClass('active');
  expect(customer).toHaveAttribute('aria-pressed', 'true');
});

test('restores a direct section link after the React app mounts', async () => {
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
  const originalScrollTo = window.scrollTo;
  const scrollIntoView = jest.fn();
  const scrollTo = jest.fn();
  HTMLElement.prototype.scrollIntoView = scrollIntoView;
  window.scrollTo = scrollTo;
  window.history.replaceState({}, '', '/#connect');

  const { unmount } = render(<App />);

  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
  await waitFor(() => {
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  unmount();
  window.history.replaceState({}, '', '/');
  if (originalScrollIntoView) {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  } else {
    delete HTMLElement.prototype.scrollIntoView;
  }
  window.scrollTo = originalScrollTo;
});
