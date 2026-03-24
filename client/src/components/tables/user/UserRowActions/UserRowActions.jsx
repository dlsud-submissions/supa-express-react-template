import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { MoreVertical, UserCog, ShieldAlert } from 'lucide-react';
import styles from './UserRowActions.module.css';

/**
 * Dropdown actions menu for a user table row.
 * - Renders trigger button; dropdown uses a portal to avoid overflow clipping.
 * - Closes on outside click via data attribute detection.
 * - Permission flags are computed by the parent UserRow.
 * @param {Object} props
 * @param {Object} props.targetUser - The user this row represents.
 * @param {boolean} props.canPromote - Whether the promote action should be shown.
 * @param {boolean} props.canDemote - Whether the demote action should be shown.
 * @param {function} props.onPromote - Called when promote is clicked.
 * @param {function} props.onDemote - Called when demote is clicked.
 * @returns {JSX.Element}
 */
const UserRowActions = ({
  targetUser,
  canPromote,
  canDemote,
  onPromote,
  onDemote,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click — exclude both wrapper and portal dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        !event.target.closest('[data-dropdown="user-row-actions"]')
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Opens the dropdown and calculates its fixed position from the trigger button.
   */
  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsMenuOpen((prev) => !prev);
  };

  /**
   * Navigates to the detailed profile view.
   */
  const handleViewProfile = () => {
    navigate(`/profile/${targetUser.id}`);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.actionsWrapper} ref={wrapperRef}>
      <button
        ref={triggerRef}
        className={`${styles.menuTrigger} flex-center`}
        onClick={handleOpen}
        aria-label="Open actions menu"
      >
        <MoreVertical size={18} />
      </button>

      {isMenuOpen &&
        createPortal(
          <div
            className={`${styles.dropdown} animate-slide-up`}
            data-dropdown="user-row-actions"
            style={{
              position: 'fixed',
              top: dropdownStyle.top,
              right: dropdownStyle.right,
            }}
          >
            <button className={styles.dropdownItem} onClick={handleViewProfile}>
              View Profile
            </button>

            {canPromote && (
              <button
                className={`${styles.dropdownItem} ${styles.promoteAction} flex-center`}
                onClick={() => {
                  onPromote();
                  setIsMenuOpen(false);
                }}
              >
                <UserCog size={14} />
                <span>Promote to Admin</span>
              </button>
            )}

            {canDemote && (
              <button
                className={`${styles.dropdownItem} ${styles.demoteAction} flex-center`}
                onClick={() => {
                  onDemote();
                  setIsMenuOpen(false);
                }}
              >
                <ShieldAlert size={14} />
                <span>Demote to User</span>
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default UserRowActions;
