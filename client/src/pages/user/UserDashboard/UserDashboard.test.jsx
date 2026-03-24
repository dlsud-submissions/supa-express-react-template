import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import UserDashboard from './UserDashboard';

// Mock the auth hook to provide user context
vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('UserDashboard Component', () => {
  it('renders a personalized greeting with the username', () => {
    // --- Arrange ---
    // Define mock user data
    const mockUser = { username: 'testuser123', role: 'USER' };
    vi.mocked(useAuth).mockReturnValue({ user: mockUser });

    // --- Act ---
    render(<UserDashboard />);

    // --- Assert ---
    expect(screen.getByText(/welcome back, testuser123!/i)).toBeInTheDocument();
  });
});