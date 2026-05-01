import styles from './GoogleAuthButton.module.css';

/**
 * Reusable Google OAuth trigger button.
 * - Uses an inline Google "G" mark to avoid external asset dependencies.
 * - Supports a loading state while the OAuth redirect is being prepared.
 * @param {Object} props
 * @param {() => void} props.onClick - Called when the button is pressed.
 * @param {boolean} [props.isLoading=false] - Disables the button and shows loading text.
 * @param {string} [props.label='Continue with Google'] - Visible button label.
 * @returns {JSX.Element}
 */
const GoogleAuthButton = ({
  onClick,
  isLoading = false,
  label = 'Continue with Google',
}) => {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      disabled={isLoading}
      aria-label={label}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <svg
          className={styles.logo}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill="#EA4335"
            d="M12 10.2v3.92h5.45c-.24 1.26-.96 2.33-2.05 3.05l3.32 2.58c1.93-1.78 3.05-4.4 3.05-7.5 0-.72-.07-1.41-.19-2.05H12Z"
          />
          <path
            fill="#4285F4"
            d="M12 22c2.76 0 5.07-.91 6.76-2.46l-3.32-2.58c-.92.62-2.1.99-3.44.99-2.64 0-4.87-1.78-5.66-4.17H2.9v2.66A10.2 10.2 0 0 0 12 22Z"
          />
          <path
            fill="#FBBC05"
            d="M6.34 13.78A6.12 6.12 0 0 1 6.02 12c0-.62.11-1.22.32-1.78V7.56H2.9A10.18 10.18 0 0 0 1.8 12c0 1.63.39 3.18 1.1 4.44l3.44-2.66Z"
          />
          <path
            fill="#34A853"
            d="M12 6.05c1.5 0 2.85.52 3.91 1.53l2.93-2.93C17.06 2.98 14.75 2 12 2A10.2 10.2 0 0 0 2.9 7.56l3.44 2.66C7.13 7.83 9.36 6.05 12 6.05Z"
          />
        </svg>
      )}

      <span className={styles.label}>
        {isLoading ? 'Connecting to Google...' : label}
      </span>
    </button>
  );
};

export default GoogleAuthButton;
