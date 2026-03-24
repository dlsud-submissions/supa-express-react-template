import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
} from '../../../../modules/utils/testing/testing.utils';
import UserRowActions from './UserRowActions';

/**
 * Unit tests for the UserRowActions component.
 * - Verifies dropdown visibility toggle.
 * - Validates conditional rendering of promote/demote actions.
 * - Validates callback invocation on action click.
 */
describe('UserRowActions Component', () => {
  const baseProps = {
    targetUser: { id: '1', username: 'jdoe' },
    canPromote: false,
    canDemote: false,
    onPromote: vi.fn(),
    onDemote: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the menu trigger button', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <UserRowActions {...baseProps} />
            </td>
          </tr>
        </tbody>
      </table>
    );

    // --- Assert ---
    expect(screen.getByLabelText(/open actions menu/i)).toBeInTheDocument();
  });

  it('shows View Profile on trigger click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // --- Act ---
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <UserRowActions {...baseProps} />
            </td>
          </tr>
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));

    // --- Assert ---
    expect(screen.getByText(/view profile/i)).toBeInTheDocument();
  });

  it('shows promote action only when canPromote is true', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // --- Act ---
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <UserRowActions {...baseProps} canPromote={true} />
            </td>
          </tr>
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));

    // --- Assert ---
    expect(screen.getByText(/promote to admin/i)).toBeInTheDocument();
    expect(screen.queryByText(/demote to user/i)).not.toBeInTheDocument();
  });

  it('shows demote action only when canDemote is true', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // --- Act ---
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <UserRowActions {...baseProps} canDemote={true} />
            </td>
          </tr>
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));

    // --- Assert ---
    expect(screen.getByText(/demote to user/i)).toBeInTheDocument();
    expect(screen.queryByText(/promote to admin/i)).not.toBeInTheDocument();
  });

  it('calls onPromote when promote is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onPromote = vi.fn();

    // --- Act ---
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <UserRowActions
                {...baseProps}
                canPromote={true}
                onPromote={onPromote}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));
    await user.click(screen.getByText(/promote to admin/i));

    // --- Assert ---
    expect(onPromote).toHaveBeenCalledTimes(1);
  });

  it('calls onDemote when demote is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onDemote = vi.fn();

    // --- Act ---
    render(
      <table>
        <tbody>
          <tr>
            <td>
              <UserRowActions
                {...baseProps}
                canDemote={true}
                onDemote={onDemote}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));
    await user.click(screen.getByText(/demote to user/i));

    // --- Assert ---
    expect(onDemote).toHaveBeenCalledTimes(1);
  });
});
