import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import App from './App';

// Partial mock to keep AuthProvider component but mock the hook
vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('App Component', () => {
  it('renders a loading state when initializing', () => {
    // --- Arrange ---
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({ loading: true });

    // --- Act ---
    render(<App />);

    // --- Assert ---
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Initializing session.../i)).toBeInTheDocument();
  });

  it('renders the application shell after loading', () => {
    // --- Arrange ---
    // Mock successful load
    vi.mocked(useAuth).mockReturnValue({ loading: false });

    // --- Act ---
    const { container } = render(<App />);

    // --- Assert ---
    // Select main tag from rendered container
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveClass('container');
  });
});
