import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
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
    render(
      <MemoryRouter>
        <ReturnHomeButton />
      </MemoryRouter>
    );

    // Assert
    expect(screen.getByText('Return Home')).toBeDefined();
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('navigates to the correct path when clicked', () => {
    // Arrange
    const testPath = '/dashboard';
    render(
      <MemoryRouter>
        <ReturnHomeButton to={testPath} />
      </MemoryRouter>
    );

    // Act
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith(testPath);
  });
});
