import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import TableContainer from './TableContainer';

// Mock AuthProvider to prevent background auth checks
vi.mock(
  '../../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);

/**
 * Unit tests for the TableContainer component.
 * - Validates column header rendering.
 * - Validates empty state handling.
 * - Validates renderRow delegation.
 */
describe('TableContainer Component', () => {
  const columns = ['User', 'Role', 'Joined', 'Actions'];

  it('renders the empty state when data is empty', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <TableContainer
        data={[]}
        columns={columns}
        renderRow={() => null}
        emptyMessage="No users found in the directory."
      />
    );

    // --- Assert ---
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders a custom empty message', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <TableContainer
        data={[]}
        columns={columns}
        renderRow={() => null}
        emptyMessage="No transactions available."
      />
    );

    // --- Assert ---
    expect(screen.getByText(/no transactions available/i)).toBeInTheDocument();
  });

  it('renders column headers', () => {
    // --- Arrange ---
    const mockData = [{ id: '1', name: 'alice' }];

    // --- Act ---
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

    // --- Assert ---
    columns.forEach((col) => {
      expect(screen.getByText(col)).toBeInTheDocument();
    });
  });

  it('calls renderRow for each data item', () => {
    // --- Arrange ---
    const mockData = [
      { id: '1', name: 'alice' },
      { id: '2', name: 'bob' },
    ];

    // --- Act ---
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

    // --- Assert ---
    expect(screen.getAllByTestId('mock-row')).toHaveLength(2);
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });
});
