import { Link } from 'react-router-dom';
import styles from './NoPage.module.css';

export default function NoPage() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1>Page not found</h1>
      <p>That page doesn&rsquo;t exist, or it may have moved.</p>
      <Link to="/">Back to all models</Link>
    </div>
  );
}
