"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

const QUICK_LINKS = [
  { icon: "fas fa-plus-circle", label: "Add New Lead",  href: "/leads/new",   color: "#F5C400", bg: "rgba(245,196,0,0.12)" },
  { icon: "fas fa-calendar-check", label: "View Tasks", href: "/tasks",       color: "#1d4ed8", bg: "#eff6ff" },
  { icon: "fas fa-users",       label: "All Leads",     href: "/leads",       color: "#15803d", bg: "#f0fdf4" },
  { icon: "fas fa-chart-bar",   label: "Reports",       href: "/reports",     color: "#7e22ce", bg: "#fdf4ff" },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [dbUser, setDbUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    async function checkSubscription() {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const hasSub = data.success && Array.isArray(data.orders) && data.orders.length > 0;
        setHasSubscription(hasSub);
        if (!hasSub) router.replace("/add-package");
      } catch (err) {
        console.error("Failed to verify subscription", err);
        setHasSubscription(false);
      }
    }

    checkSubscription();
  }, [isLoaded, user, getToken, router]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchUser() {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setDbUser(data.data);
      } catch (err) {
        console.error("Failed to fetch user from DB:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [isLoaded, user, getToken]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.firstName || dbUser?.first_name || "there";

  if (!isLoaded || hasSubscription === null || loading) {
    return (
      <div className={styles.loadingState}>
        <i className="fas fa-spinner fa-spin" style={{ color: "#F5C400" }} />
        Loading your dashboard...
      </div>
    );
  }

  if (hasSubscription === false) {
    return (
      <div className={styles.loadingState}>
        <i className="fas fa-spinner fa-spin" style={{ color: "#F5C400" }} />
        Redirecting to package setup...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p className={styles.greeting}>{greeting()}</p>
            <h1 className={styles.name}>
              Welcome back, <span>{firstName}</span>
            </h1>
            {dbUser?.role && (
              <div className={styles.roleBadge}>
                <i className="fas fa-shield-alt" style={{ marginRight: "5px" }} />
                {dbUser.role}
              </div>
            )}
          </div>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={firstName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.statsGrid}>
          {[
            { label: "Total Leads",       val: "—", sub: "Connect your pipeline",       neutral: true },
            { label: "Open Tasks",        val: "—", sub: "Assign tasks to get started", neutral: true },
            { label: "Follow-ups Today",  val: "—", sub: "No follow-ups scheduled",     neutral: true },
            { label: "Closed This Month", val: "—", sub: "Start closing deals",         neutral: true },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statVal}>{s.val}</p>
              <p className={`${styles.statSub} ${s.neutral ? styles.statSubNeutral : ""}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.panel}>
            <p className={styles.panelTitle}>Quick Actions</p>
            <div className={styles.quickGrid}>
              {QUICK_LINKS.map((ql) => (
                <Link key={ql.href} href={ql.href} className={styles.quickBtn}>
                  <div className={styles.quickIcon} style={{ background: ql.bg, color: ql.color }}>
                    <i className={ql.icon} />
                  </div>
                  <span className={styles.quickLabel}>{ql.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <p className={styles.panelTitle}>Your Account Info</p>
            {dbUser ? (
              <>
                {[
                  { k: "Full Name",    v: `${dbUser.first_name || ""} ${dbUser.last_name || ""}`.trim() || "—" },
                  { k: "Email",        v: dbUser.email || "—" },
                  { k: "Role",         v: dbUser.role, badge: true },
                  { k: "Member Since", v: dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                  { k: "Last Login",   v: dbUser.last_login ? new Date(dbUser.last_login).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—" },
                ].map((row) => (
                  <div key={row.k} className={styles.infoRow}>
                    <span className={styles.infoKey}>{row.k}</span>
                    {row.badge ? (
                      <span className={styles.infoBadge}>{row.v}</span>
                    ) : (
                      <span className={styles.infoVal}>{row.v}</span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p style={{ fontFamily: "Georgia, serif", fontSize: "14px", color: "#9ca3af" }}>
                Could not load account info. Make sure your backend is running.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}