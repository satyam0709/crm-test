import { SignIn } from "@clerk/nextjs";
import styles from "./page.module.css";

export const metadata = {
  title: "Login – RND TECHNOSOFT CRM",
  description: "Sign in to your RND TECHNOSOFT CRM account.",
};

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>RND</span>
          <span className={styles.logoText}>TECHNOSOFT</span>
        </div>
        <h1 className={styles.panelTitle}>
          Welcome back to your <span>sales command center</span>
        </h1>
        <p className={styles.panelDesc}>
          Pick up right where you left off. Your leads, tasks, and team are
          waiting.
        </p>
        <ul className={styles.bullets}>
          {[
            "All your leads in one place",
            "Follow-ups that never fall through",
            "Real-time team collaboration",
            "Instant alerts on every new lead",
          ].map((item) => (
            <li key={item} className={styles.bullet}>
              <span className={styles.bulletDot} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.clerkPanel}>
        <SignIn forceRedirectUrl="/add-package" signUpUrl="/register" />
      </div>
    </div>
  );
}
