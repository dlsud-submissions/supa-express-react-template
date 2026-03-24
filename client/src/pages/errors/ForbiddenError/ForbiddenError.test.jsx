import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import ForbiddenError from './ForbiddenError';

// Mock AuthProvider to prevent background state updates
vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

describe('ForbiddenError Component', () => {
  it('should render the 403 error code and permission message', () => {
    // --- Arrange ---
    render(<ForbiddenError />);

    // --- Act ---
    const heading = screen.getByText('403');
    const subHeading = screen.getByText(/access denied/i);

    // --- Assert ---
    expect(heading).toBeInTheDocument();
    expect(subHeading).toBeInTheDocument();
  });

  it('should navigate to home when clicking the return button', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    
    // Create a stable reference to the mock function
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(<ForbiddenError />);

    // --- Act ---
    const returnBtn = screen.getByRole('button', { name: /return home/i });
    await user.click(returnBtn);

    // --- Assert ---
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});