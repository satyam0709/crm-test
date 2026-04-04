"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const UNGATED = ["/add-package"];

export default function SubscriptionGate({ children }) {
  const { getToken, isLoaded, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState("checking");

  const isUngated = UNGATED.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.replace("/login");
      return;
    }

    if (isUngated) {
      setStatus("ok");
      return;
    }

    let cancelled = false;

    async function checkSubscription() {
      try {
        const token = await getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (cancelled) return;

        const hasSub =
          data.success &&
          Array.isArray(data.orders) &&
          data.orders.length > 0;

        if (hasSub) {
          setStatus("ok");
        } else {
          setStatus("locked");
          router.replace("/add-package");
        }
      } catch {
        if (!cancelled) setStatus("ok");
      }
    }

    checkSubscription();
    return () => { cancelled = true; };
  }, [isLoaded, userId, pathname, isUngated]);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          gap: "10px",
          fontFamily: "var(--font-display)",
          fontSize: "14px",
          color: "var(--text-muted)",
        }}
      >
        <i className="fas fa-spinner fa-spin" style={{ color: "#F5C400" }} />
        Verifying your account...
      </div>
    );
  }

  if (status === "locked") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          gap: "10px",
          fontFamily: "var(--font-display)",
          fontSize: "14px",
          color: "var(--text-muted)",
        }}
      >
        <i className="fas fa-spinner fa-spin" style={{ color: "#F5C400" }} />
        Redirecting to package setup...
      </div>
    );
  }

  return children;
}