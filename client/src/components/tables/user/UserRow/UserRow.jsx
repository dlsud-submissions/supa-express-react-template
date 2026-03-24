import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../../providers/ToastProvider/ToastProvider';
import { adminApi } from '../../../../modules/api/admin/admin.api';
import ConfirmationModal from '../../../feedback/modals/ConfirmationModal/ConfirmationModal';
import UserRowActions from '../UserRowActions/UserRowActions';
import styles from './UserRow.module.css';

/**
 * Table row for user management.
 * - Displays identity, role, and metadata.
 * - Delegates action menu rendering to UserRowActions.
 * - Owns role change state and API calls.
 * @param {Object} props - Component properties.
 * @param {Object} props.user - The target user object for this row.
 * @param {function} props.onUpdate - Callback to refresh the list after a role change.
 * @returns {JSX.Element}
 */
const UserRow = ({ user: targetUser, onUpdate }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  // Track which action is pending confirmation: null | 'promote' | 'demote'
  const [pendingAction, setPendingAction] = useState(null);

  const canPromote =
    currentUser?.role === 'SUPER_ADMIN' && targetUser.role === 'USER';

  const canDemote =
    currentUser?.role === 'SUPER_ADMIN' && targetUser.role === 'ADMIN';

  /**
   * Executes the confirmed role change action via Admin API.
   * - Calls promote or demote based on pendingAction state.
   * - Triggers onUpdate callback to refresh the list in place.
   */
  const handleConfirmAction = async () => {
    const isPromote = pendingAction === 'promote';
    const apiCall = isPromote
      ? adminApi.promoteUser(targetUser.id)
      : adminApi.demoteUser(targetUser.id);
    const successMsg = isPromote
      ? `${targetUser.username} promoted to Admin`
      : `${targetUser.username} demoted to User`;
    const errorMsg = isPromote
      ? 'Failed to promote user'
      : 'Failed to demote user';

    setPendingAction(null);

    try {
      const response = await apiCall;

      if (response.ok) {
        showToast(successMsg, 'success');
        onUpdate();
      } else {
        showToast(errorMsg, 'error');
      }
    } catch {
      showToast('An unexpected error occurred', 'error');
    }
  };

  const confirmModal = {
    promote: {
      title: 'Promote to Admin',
      message: `Are you sure you want to promote ${targetUser.username} to Admin?`,
      confirmLabel: 'Promote',
    },
    demote: {
      title: 'Demote to User',
      message: `Are you sure you want to demote ${targetUser.username} to User?`,
      confirmLabel: 'Demote',
    },
  };

  return (
    <>
      <tr className={styles.row}>
        <td className={styles.cell}>
          <div className={styles.userInfo}>
            <div className={`${styles.avatar} flex-center`}>
              {targetUser.username.charAt(0).toUpperCase()}
            </div>
            <span className={styles.username}>{targetUser.username}</span>
          </div>
        </td>
        <td className={styles.cell}>
          <span className={styles.roleBadge}>{targetUser.role}</span>
        </td>
        <td className={styles.cell}>
          <span className={styles.date}>
            {new Date(targetUser.createdAt).toLocaleDateString()}
          </span>
        </td>
        <td className={`${styles.cell} ${styles.actionsArea}`}>
          <UserRowActions
            targetUser={targetUser}
            canPromote={canPromote}
            canDemote={canDemote}
            onPromote={() => setPendingAction('promote')}
            onDemote={() => setPendingAction('demote')}
          />
        </td>
      </tr>

      {pendingAction && (
        <ConfirmationModal
          isOpen={true}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
          title={confirmModal[pendingAction].title}
          message={confirmModal[pendingAction].message}
          confirmLabel={confirmModal[pendingAction].confirmLabel}
        />
      )}
    </>
  );
};

export default UserRow;
