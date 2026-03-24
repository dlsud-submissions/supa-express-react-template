import { useState, useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { adminApi } from '../../../modules/api/admin/admin.api';
import TableContainer from '../../../components/tables/TableContainer/TableContainer';
import UserRow from '../../../components/tables/user/UserRow/UserRow';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import styles from './UserManagementPage.module.css';

/**
 * Administrative User Management Page.
 * - Synchronizes with /api/admin/users.
 * - Handles asynchronous states: loading, error, and success.
 * - Uses Lucide icons for status and actions.
 * @returns {JSX.Element} The rendered user management view.
 */
const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches user data from the server.
   * - Extracts the users array from the wrapped response object.
   * - Manages loading and error states during the request lifecycle.
   */
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminApi.getAllUsers();

      if (!response.ok) {
        throw new Error('Failed to retrieve user directory.');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <Users size={32} className={styles.headerIcon} />
            <h1 className={styles.title}>User Management</h1>
          </div>
          <p className={styles.stats}>Total Users: {users?.length || 0}</p>
        </div>
      </header>

      <div className={styles.listWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Spinner size="3rem" />
            <p>Loading user records...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button onClick={fetchUsers} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Retry Fetch
            </button>
          </div>
        ) : (
          <div className={styles.listArea}>
            <TableContainer
              data={users}
              columns={['User', 'Role', 'Joined', 'Actions']}
              renderRow={(user) => (
                <UserRow key={user.id} user={user} onUpdate={fetchUsers} />
              )}
              emptyMessage="No users found in the directory."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
