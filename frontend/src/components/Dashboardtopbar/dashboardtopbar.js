"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "../Navbar/ThemeToggle";
import styles from "./dashboardtopbar.module.css";

const QUICK_ACTIONS = [
  { label: "Lead", icon: "fa-filter", href: "/leads/new" },
  { label: "Task", icon: "fa-list-check", href: "/tasks/new" },
  { label: "Reminder", icon: "fa-bell", href: "/reminders/new" },
  { label: "Meeting", icon: "fa-video", href: "/meetings/new" },
  { label: "Note", icon: "fa-note-sticky", href: "/notes/new" },
  { label: "Invoice", icon: "fa-file-invoice-dollar", href: "/invoice/sales/new" },
];

export default function DashboardTopbar({ onMenuToggle, sidebarCollapsed }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="Toggle menu">
          <i className="fas fa-bars" />
        </button>
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} href={a.href} className={styles.quickBtn}>
              <i className={`fas ${a.icon}`} />
              <span>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <form
          className={`${styles.searchForm} ${searchOpen ? styles.searchOpen : ""}`}
          onSubmit={handleSearch}
        >
          <button
            type="button"
            className={styles.searchToggle}
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <i className="fas fa-search" />
          </button>
          {searchOpen && (
            <input
              ref={searchRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search leads, tasks..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          )}
        </form>

        <ThemeToggle />

        <button className={styles.iconBtn} aria-label="Notifications">
          <i className="fas fa-bell" />
          <span className={styles.notifBadge}>3</span>
        </button>

        <div className={styles.userArea}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: 34, height: 34 },
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}