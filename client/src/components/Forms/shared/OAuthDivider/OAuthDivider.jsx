import styles from './OAuthDivider.module.css';

/**
 * Divider separator for OAuth login options.
 * - Renders "or" text between form and OAuth buttons.
 * - Uses CSS lines to create the horizontal divider effect.
 * @param {Object} props
 * @param {string} [props.label='or'] - The divider text.
 * @returns {JSX.Element}
 */
const OAuthDivider = ({ label = 'or' }) => {
  return (
    <div className={styles.divider}>
      <span className={styles.dividerText}>{label}</span>
    </div>
  );
};

export default OAuthDivider;
