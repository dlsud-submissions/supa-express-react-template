import { RefreshCw, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import TableContainer from '../../../components/tables/TableContainer/TableContainer';
import UserRow from '../../../components/tables/user/UserRow/UserRow';
import { adminApi } from '../../../modules/api/admin/admin.api';
import styles from './UserManagementPage.module.css';

/**
 * Administrative User Management Page.
 * - Synchronizes with Supabase public.users via adminApi.
 * - Consumes { data, error } return shape from Supabase CRUD.
 * @returns {JSX.Element}
 */
const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: apiError } = await adminApi.getAllUsers();

      if (apiError)
        throw new Error(
          apiError.message || 'Failed to retrieve user directory.'
        );

      setUsers(data || []);
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
