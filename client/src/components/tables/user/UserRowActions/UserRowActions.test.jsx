import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
} from '../../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../../providers/AuthProvider/AuthProvider';
import UserRowActions from './UserRowActions';

vi.mock(
  '../../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => <>{children}</>,
    };
  }
);

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
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN' } });
  });

  it('renders the menu trigger button', () => {
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

    expect(screen.getByLabelText(/open actions menu/i)).toBeInTheDocument();
  });

  it('shows View Profile on trigger click', async () => {
    const user = userEvent.setup();

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

    expect(screen.getByText(/view profile/i)).toBeInTheDocument();
  });

  it('shows promote action only when canPromote is true', async () => {
    const user = userEvent.setup();

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

    expect(screen.getByText(/promote to admin/i)).toBeInTheDocument();
    expect(screen.queryByText(/demote to user/i)).not.toBeInTheDocument();
  });

  it('shows demote action only when canDemote is true', async () => {
    const user = userEvent.setup();

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

    expect(screen.getByText(/demote to user/i)).toBeInTheDocument();
    expect(screen.queryByText(/promote to admin/i)).not.toBeInTheDocument();
  });

  it('calls onPromote when promote is clicked', async () => {
    const user = userEvent.setup();
    const onPromote = vi.fn();

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

    expect(onPromote).toHaveBeenCalledTimes(1);
  });

  it('calls onDemote when demote is clicked', async () => {
    const user = userEvent.setup();
    const onDemote = vi.fn();

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

    expect(onDemote).toHaveBeenCalledTimes(1);
  });
});
