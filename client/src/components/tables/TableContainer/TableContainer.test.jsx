import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import TableContainer from './TableContainer';

// AuthProvider is handled by customRender via testing.utils.
// The global Supabase mock in vitest.setup.jsx provides a safe default
// getSession() stub, so no additional mock is needed here.

/**
 * Unit tests for the TableContainer component.
 * - Validates column header rendering.
 * - Validates empty state handling.
 * - Validates renderRow delegation.
 */
describe('TableContainer Component', () => {
  const columns = ['User', 'Role', 'Joined', 'Actions'];

  it('renders the empty state when data is empty', () => {
    render(
      <TableContainer
        data={[]}
        columns={columns}
        renderRow={() => null}
        emptyMessage="No users found in the directory."
      />
    );

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders a custom empty message', () => {
    render(
      <TableContainer
        data={[]}
        columns={columns}
        renderRow={() => null}
        emptyMessage="No transactions available."
      />
    );

    expect(screen.getByText(/no transactions available/i)).toBeInTheDocument();
  });

  it('renders column headers', () => {
    const mockData = [{ id: '1', name: 'alice' }];

    render(
      <TableContainer
        data={mockData}
        columns={columns}
        renderRow={(item) => (
          <tr key={item.id} data-testid="mock-row">
            <td>{item.name}</td>
          </tr>
        )}
      />
    );

    columns.forEach((col) => {
      expect(screen.getByText(col)).toBeInTheDocument();
    });
  });

  it('calls renderRow for each data item', () => {
    const mockData = [
      { id: '1', name: 'alice' },
      { id: '2', name: 'bob' },
    ];

    render(
      <TableContainer
        data={mockData}
        columns={columns}
        renderRow={(item) => (
          <tr key={item.id} data-testid="mock-row">
            <td>{item.name}</td>
          </tr>
        )}
      />
    );

    expect(screen.getAllByTestId('mock-row')).toHaveLength(2);
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });
});
