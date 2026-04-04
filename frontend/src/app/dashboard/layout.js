"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import DashboardTopbar from "../../components/Dashboardtopbar/dashboardtopbar";
import SubscriptionGate from "../../components/SubscriptionGate/subscriptionGate";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  return (
    <SubscriptionGate>
      <div className={styles.shell}>
        {mobileOpen && (
          <div
            className={styles.overlay}
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <div className={`${styles.main} ${collapsed ? styles.mainCollapsed : ""}`}>
          <DashboardTopbar onMenuToggle={toggleSidebar} isExpanded={!collapsed} />
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </SubscriptionGate>
  );
}