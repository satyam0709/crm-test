"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: '32px', height: '32px' }}></div>; // placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        background: "none",
        border: "1px solid var(--border-color)",
        color: "var(--text-main)",
        cursor: "pointer",
        padding: "0.4rem 0.6rem",
        borderRadius: "4px",
        fontSize: "1.2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}