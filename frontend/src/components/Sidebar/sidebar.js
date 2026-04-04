"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import Image from "next/image";

const NAV = [
  {
    section: "Main",
    items: [
      { label: "Dashboard", icon: "fa-gauge-high",   href: "/dashboard",  color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
      { label: "Lead",      icon: "fa-filter",        href: "/leads",      color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
      { label: "Task",      icon: "fa-list-check",    href: "/tasks",      color: "#22c55e", bg: "rgba(34,197,94,0.15)"  },
      { label: "Reminder",  icon: "fa-bell",          href: "/reminders",  color: "#f97316", bg: "rgba(249,115,22,0.15)" },
      { label: "Meeting",   icon: "fa-video",         href: "/meetings",   color: "#06b6d4", bg: "rgba(6,182,212,0.15)"  },
    ],
  },
  {
    section: "Workspace",
    items: [
      { label: "Notes",    icon: "fa-note-sticky",   href: "/notes",     color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
      { label: "Chat",     icon: "fa-comments",       href: "/chat",      color: "#8b5cf6", bg: "rgba(139,92,246,0.15)"  },
      { label: "Calendar", icon: "fa-calendar-days",  href: "/calendar",  color: "#3b82f6", bg: "rgba(59,130,246,0.15)"  },
      { label: "Customer", icon: "fa-users",          href: "/customers", color: "#a855f7", bg: "rgba(168,85,247,0.15)"  },
      { label: "Storage",  icon: "fa-hard-drive",     href: "/storage",   color: "#14b8a6", bg: "rgba(20,184,166,0.15)"  },
      { label: "Reports",  icon: "fa-chart-bar",      href: "/reports",   color: "#6366f1", bg: "rgba(99,102,241,0.15)"  },
    ],
  },
  {
    section: "Finance",
    items: [
      {
        label: "Invoice", icon: "fa-file-invoice-dollar", color: "#22c55e", bg: "rgba(34,197,94,0.15)",
        children: [
          { label: "Sales Invoice",    href: "/invoice/sales"    },
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
        label: "HR", icon: "fa-user-tie", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)",
        children: [
          { label: "Employees",  href: "/hr/employees"  },
          { label: "Attendance", href: "/hr/attendance" },
          { label: "Leave",      href: "/hr/leave"      },
        ],
      },
      {
        label: "HR Operations", icon: "fa-people-group", color: "#f97316", bg: "rgba(249,115,22,0.15)",
        children: [
          { label: "Payroll",    href: "/hr-ops/payroll"    },
          { label: "Appraisals", href: "/hr-ops/appraisals" },
        ],
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "General Settings", icon: "fa-gear", color: "#64748b", bg: "rgba(100,116,139,0.15)",
        children: [
          { label: "Profile",      href: "/settings/profile"      },
          { label: "Company",      href: "/settings/company"      },
          { label: "Integrations", href: "/settings/integrations" },
        ],
      },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen, onToggle }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive      = (href)     => pathname === href || pathname.startsWith(href + "/");
  const isParentActive = (children) => children?.some((c) => isActive(c.href));

  const renderItem = (item) => {
    if (item.children) {
      const open         = openMenus[item.label] || isParentActive(item.children);
      const parentActive = isParentActive(item.children);

      return (
        <div key={item.label} className={styles.group}>
          <button
            className={`${styles.navItem} ${parentActive ? styles.active : ""}`}
            onClick={() => toggleMenu(item.label)}
            title={collapsed ? item.label : undefined}
          >
            <span
              className={styles.iconBadge}
              style={{ background: item.bg, color: item.color }}
            >
              <i className={`fas ${item.icon}`} />
            </span>
            {!collapsed && (
              <>
                <span className={styles.label}>{item.label}</span>
                <i
                  className={`fas fa-chevron-right ${styles.arrow} ${open ? styles.arrowOpen : ""}`}
                />
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
        <span
          className={styles.iconBadge}
          style={{ background: item.bg, color: item.color }}
        >
          <i className={`fas ${item.icon}`} />
        </span>
        {!collapsed && <span className={styles.label}>{item.label}</span>}
        {isActive(item.href) && !collapsed && <span className={styles.activePip} />}
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
            <Image src="/assets/logo.png" alt="RND CRM" width={32} height={32} className={styles.logo} />
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
          <div key={group.section} className={styles.section}>
            {!collapsed && (
              <div className={styles.navSection}>{group.section}</div>
            )}
            {collapsed && <div className={styles.sectionDivider} />}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>
    </aside>
  );
}