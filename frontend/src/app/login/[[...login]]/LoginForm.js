"use client";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginForm() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setChecking(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        const hasSubscription = data.success && Array.isArray(data.orders) && data.orders.length > 0;

        router.replace(hasSubscription ? "/dashboard" : "/add-package");
      } catch (err) {
        console.error("Error checking subscription", err);
      } finally {
        setChecking(false);
      }
    };

    checkSubscription();
  }, [isLoaded, isSignedIn, getToken, router]);

  if (checking || (isLoaded && isSignedIn)) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Processing...</p>
      </div>
    );
  }

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
          Pick up right where you left off. Your leads, tasks, and team are waiting.
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