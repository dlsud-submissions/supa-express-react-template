import styles from './TableContainer.module.css';

/**
 * Generic table shell for tabular data displays.
 * - Renders a semantic table with dynamic columns.
 * - Delegates row rendering to the caller via renderRow.
 * - Handles empty states gracefully.
 * @param {Object} props - Component properties.
 * @param {Array} props.data - Array of data objects to display.
 * @param {string[]} props.columns - Column header labels.
 * @param {function} props.renderRow - Function receiving a data item, returns a <tr> element.
 * @param {string} [props.emptyMessage='No data found.'] - Message shown when data is empty.
 * @returns {JSX.Element}
 */
const TableContainer = ({
  data,
  columns,
  renderRow,
  emptyMessage = 'No data found.',
}) => {
  // Check if dataset is empty to show feedback
  const isEmpty = !data || data.length === 0;

  return (
    <div className={styles.tableWrapper}>
      {isEmpty ? (
        <div className={styles.emptyState}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className={styles[`col${col}`]}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{data.map(renderRow)}</tbody>
        </table>
      )}
    </div>
  );
};

export default TableContainer;
