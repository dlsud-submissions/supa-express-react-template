import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ReturnHomeButton from './ReturnHomeButton';

// Mock navigation
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('ReturnHomeButton', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    // Arrange
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders with the default label and icon', () => {
    // Act
    render(<ReturnHomeButton />);

    // Assert
    expect(screen.getByText('Return Home')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('navigates to the correct path when clicked', () => {
    // Arrange
    const testPath = '/dashboard';
    render(<ReturnHomeButton to={testPath} />);

    // Act
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith(testPath);
  });
});
