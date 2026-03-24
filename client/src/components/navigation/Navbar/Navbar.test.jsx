import {
  render,
  screen,
  waitFor,
} from '../../../modules/utils/testing/testing.utils';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import { useTheme } from '../../../providers/ThemeProvider/ThemeProvider';
import Navbar from './Navbar';

vi.mock(
  '../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);

vi.mock(
  '../../../providers/ToastProvider/ToastProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useToast: vi.fn(),
      ToastProvider: ({ children }) => children,
    };
  }
);

vi.mock(
  '../../../providers/ThemeProvider/ThemeProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useTheme: vi.fn(),
      ThemeProvider: ({ children }) => children,
    };
  }
);

describe('Navbar Component', () => {
  it('renders theme toggle and calls toggleTheme on click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const mockToggleTheme = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ user: null, logout: vi.fn() });
    vi.mocked(useToast).mockReturnValue({ showToast: vi.fn() });
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });

    // --- Act ---
    render(<Navbar />);
    await user.click(screen.getByLabelText(/toggle theme/i));

    // --- Assert ---
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('calls logout and shows toast when confirmed', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const mockLogout = vi.fn().mockResolvedValue();
    const mockShowToast = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'john_doe', role: 'USER' },
      logout: mockLogout,
    });
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    // --- Act ---
    render(<Navbar />);
    await user.click(screen.getByRole('button', { name: /log out/i }));
    await user.click(screen.getByRole('button', { name: /^logout$/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'info');
    });
  });
});
