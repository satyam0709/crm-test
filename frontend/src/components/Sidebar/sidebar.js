"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";

const NAV = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: "fa-gauge-high", href: "/dashboard" },
      { label: "Lead", icon: "fa-filter", href: "/leads" },
      { label: "Task", icon: "fa-list-check", href: "/tasks" },
      { label: "Reminder", icon: "fa-bell", href: "/reminders" },
      { label: "Meeting", icon: "fa-video", href: "/meetings" },
    ],
  },
  {
    section: "Workspace",
    items: [
      { label: "Notes", icon: "fa-note-sticky", href: "/notes" },
      { label: "Chat", icon: "fa-comments", href: "/chat" },
      { label: "Calendar", icon: "fa-calendar-days", href: "/calendar" },
      { label: "Customer", icon: "fa-users", href: "/customers" },
      { label: "Storage", icon: "fa-hard-drive", href: "/storage" },
      { label: "Reports", icon: "fa-chart-bar", href: "/reports" },
    ],
  },
  {
    section: "Finance",
    items: [
      {
        label: "Invoice",
        icon: "fa-file-invoice-dollar",
        children: [
          { label: "Sales Invoice", href: "/invoice/sales" },
          { label: "Purchase Invoice", href: "/invoice/purchase" },
          { label: "Proforma Invoice", href: "/invoice/proforma" },
        ],
      },
    ],
  },
  {
    section: "People",
    items: [
      {
        label: "HR",
        icon: "fa-user-tie",
        children: [
          { label: "Employees", href: "/hr/employees" },
          { label: "Attendance", href: "/hr/attendance" },
          { label: "Leave", href: "/hr/leave" },
        ],
      },
      {
        label: "HR Operations",
        icon: "fa-people-group",
        children: [
          { label: "Payroll", href: "/hr-ops/payroll" },
          { label: "Appraisals", href: "/hr-ops/appraisals" },
        ],
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "General Settings",
        icon: "fa-gear",
        children: [
          { label: "Profile", href: "/settings/profile" },
          { label: "Company", href: "/settings/company" },
          { label: "Integrations", href: "/settings/integrations" },
        ],
      },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onToggle }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");
  const isParentActive = (children) => children?.some((c) => isActive(c.href));

  const renderItem = (item) => {
    if (item.children) {
      const open = openMenus[item.label] || isParentActive(item.children);
      const parentActive = isParentActive(item.children);
      return (
        <div key={item.label} className={styles.group}>
          <button
            className={`${styles.navItem} ${parentActive ? styles.active : ""}`}
            onClick={() => toggleMenu(item.label)}
            title={collapsed ? item.label : undefined}
          >
            <i className={`fas ${item.icon} ${styles.icon}`} />
            {!collapsed && (
              <>
                <span className={styles.label}>{item.label}</span>
                <i className={`fas fa-chevron-down ${styles.arrow} ${open ? styles.arrowOpen : ""}`} />
              </>
            )}
          </button>
          {!collapsed && (
            <div className={`${styles.subMenu} ${open ? styles.subMenuOpen : ""}`}>
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`${styles.subItem} ${isActive(child.href) ? styles.subItemActive : ""}`}
                >
                  <span className={styles.subDot} />
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
        title={collapsed ? item.label : undefined}
      >
        <i className={`fas ${item.icon} ${styles.icon}`} />
        {!collapsed && <span className={styles.label}>{item.label}</span>}
        {!collapsed && isActive(item.href) && <span className={styles.activePip} />}
      </Link>
    );
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${mobileOpen ? styles.mobileOpen : ""}`}
    >
      {/* Logo */}
      <div className={styles.logoArea}>
        {!collapsed ? (
          <Link href="/dashboard" className={styles.brand}>
            <span className={styles.logoMark}>RND</span>
            <span className={styles.logoText}>TECHNOSOFT</span>
          </Link>
        ) : (
          <Link href="/dashboard" className={styles.brandIcon}>
            <span className={styles.logoMarkSm}>R</span>
          </Link>
        )}
        <button
          className={styles.collapseBtn}
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <div className={styles.navSection}>{group.section}</div>
            )}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <div className={styles.footerAvatar}>AD</div>
        {!collapsed && (
          <div className={styles.footerInfo}>
            <div className={styles.footerName}>Admin User</div>
            <div className={styles.footerRole}>Administrator</div>
          </div>
        )}
      </div>
    </aside>
  );
}