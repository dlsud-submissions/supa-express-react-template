import { describe, it, expect, vi } from 'vitest';
import { useRouteError, useNavigate } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import NotFoundError from './NotFoundError';

// Mock AuthProvider to control user roles and prevent state side effects
vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

describe('NotFoundError Component', () => {
  it('should display the 404 code and error message', () => {
    // --- Arrange ---
    // Mock the router error context
    vi.mocked(useRouteError).mockReturnValue({ statusText: 'Not Found' });
    // Mock user as guest
    vi.mocked(useAuth).mockReturnValue({ user: null });

    // --- Act ---
    render(<NotFoundError />);
    const heading = screen.getByText('404');
    const message = screen.getByText('Not Found');

    // --- Assert ---
    expect(heading).toBeInTheDocument();
    expect(message).toBeInTheDocument();
  });

  it('should navigate to correct home path when clicking the return button', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    // Mock stable navigation function
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    // Mock standard user
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'USER' } });
    vi.mocked(useRouteError).mockReturnValue({});

    // --- Act ---
    render(<NotFoundError />);
    const returnBtn = screen.getByRole('button', { name: /return home/i });
    await user.click(returnBtn);

    // --- Assert ---
    // Verify user is sent to the standard dashboard
    expect(navigateMock).toHaveBeenCalledWith('/dashboard');
  });
});