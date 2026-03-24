import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';
import styles from './ReturnHomeButton.module.css';

/**
 * A reusable navigation button that redirects users to the home dashboard.
 * - Dynamically calculates destination based on user role if needed.
 * - Uses Lucide icons for visual consistency.
 * @param {Object} props
 * @param {string} [props.to='/'] - The destination path.
 * @param {string} [props.label='Return Home'] - The button text.
 * @returns {JSX.Element}
 */
const ReturnHomeButton = ({ to = '/', label = 'Return Home' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`${styles.button} flex-center`}
      type="button"
    >
      <Home size={18} />
      <span>{label}</span>
    </button>
  );
};

export default ReturnHomeButton;
