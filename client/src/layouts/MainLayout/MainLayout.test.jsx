import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import MainLayout from './MainLayout';

// Mock the Navbar to isolate Layout testing from Navbar logic
vi.mock('../../components/navigation/Navbar/Navbar', () => ({
  default: () => <nav data-testid="mock-navbar">Navbar</nav>,
}));

describe('MainLayout Component', () => {
  it('renders the Navbar and nested route content', () => {
    // --- Arrange ---
    // Define a test route to verify the Outlet works
    const testContent = 'Dashboard Content';

    // --- Act ---
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<div>{testContent}</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // --- Assert ---
    // Verify the persistent Navbar is present
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
    // Verify the nested route content is rendered inside the main tag
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('uses the correct semantic main tag for content', () => {
    // --- Arrange ---
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<div>Test</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // --- Act & Assert ---
    // Ensure content is wrapped in a semantic main element
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
