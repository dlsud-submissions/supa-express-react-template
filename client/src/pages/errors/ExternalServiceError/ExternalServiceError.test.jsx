import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNavigate } from 'react-router';
import userEvent from '@testing-library/user-event';
// Use centralized testing utility
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import ExternalServiceError from './ExternalServiceError';

/**
 * Integration/Unit tests for ExternalServiceError Page.
 * - Ensures recovery actions (Retry/Home) are present.
 * - Validates navigation triggers on button clicks.
 */
describe('ExternalServiceError Page', () => {
  // Define a stable mock for navigation tracking
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // Reset call history
    vi.clearAllMocks();
    // Setup stable mock for the navigation hook
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders correctly with service interruption text and status label', () => {
    // --- Arrange ---
    // Render component using custom utility
    render(<ExternalServiceError />);

    // --- Act ---
    // Components are found by text content

    // --- Assert ---
    expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
    expect(screen.getByText(/Service Interruption/i)).toBeInTheDocument();
    expect(screen.getByText(/external providers/i)).toBeInTheDocument();
  });

  it('navigates back to home when the home button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<ExternalServiceError />);

    // --- Act ---
    // Locate the return home button
    const homeBtn = screen.getByRole('button', { name: /return home/i });
    await user.click(homeBtn);

    // --- Assert ---
    // Verify navigation to root
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('refreshes the page when the try again button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<ExternalServiceError />);

    // --- Act ---
    // Locate the retry button
    const retryBtn = screen.getByRole('button', { name: /try again/i });
    await user.click(retryBtn);

    // --- Assert ---
    // Verify navigation refresh call
    expect(mockNavigate).toHaveBeenCalledWith(0);
  });
});