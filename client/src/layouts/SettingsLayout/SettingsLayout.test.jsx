import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import SettingsLayout from './SettingsLayout';

describe('SettingsLayout', () => {
  it('renders settings navigation and active outlet content', () => {
    render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <Routes>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route path="profile" element={<div>Profile content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /settings/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
      'href',
      '/settings/profile'
    );
    expect(screen.getByRole('link', { name: /account/i })).toHaveAttribute(
      'href',
      '/settings/account'
    );
    expect(screen.getByText(/profile content/i)).toBeInTheDocument();
  });
});
