import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useRouteError, useNavigate } from 'react-router';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import InternalServerError from './InternalServerError';

// Mock AuthProvider to prevent background state updates
vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

describe('InternalServerError Component', () => {
  beforeEach(() => {
    // Reset navigation and error mocks
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render the 500 status and generic error message', () => {
    // --- Arrange ---
    vi.mocked(useRouteError).mockReturnValue(new Error('Fail'));

    // --- Act ---
    render(<InternalServerError />);

    // --- Assert ---
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should navigate to home when clicking the return button', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    vi.mocked(useRouteError).mockReturnValue({});
    
    // Create a stable reference to the mock function used by the router
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    // --- Act ---
    render(<InternalServerError />);
    const returnBtn = screen.getByRole('button', { name: /return home/i });
    await user.click(returnBtn);

    // --- Assert ---
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});