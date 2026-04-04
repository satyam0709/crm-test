"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const PLANS = {
  INR: [
    {
      id: "gold",
      name: "Gold",
      priceRaw: 2750,
      price: "₹2750",
      period: "Year",
      staff: 3,
      features: [
        { label: "Lead Management", included: true },
        { label: "Task Management", included: true },
        { label: "Reminders & Meetings", included: true },
        { label: "Notes & Calendar", included: true },
        { label: "Customer Management", included: true },
        { label: "Basic Reports", included: true },
        { label: "Invoice Management", included: false },
        { label: "HR Management", included: false },
        { label: "HR Operations (Payroll)", included: false },
        { label: "Advanced Analytics", included: false },
      ],
    },
    {
      id: "diamond",
      name: "Diamond",
      priceRaw: 4350,
      price: "₹4350",
      period: "Year",
      staff: 5,
      features: [
        { label: "Lead Management", included: true },
        { label: "Task Management", included: true },
        { label: "Reminders & Meetings", included: true },
        { label: "Notes & Calendar", included: true },
        { label: "Customer Management", included: true },
        { label: "Advanced Reports", included: true },
        { label: "Invoice Management", included: true },
        { label: "HR Management", included: false },
        { label: "HR Operations (Payroll)", included: false },
        { label: "Advanced Analytics", included: false },
      ],
    },
    {
      id: "platinum",
      name: "Platinum",
      priceRaw: 7800,
      price: "₹7800",
      period: "Year",
      staff: 8,
      features: [
        { label: "Lead Management", included: true },
        { label: "Task Management", included: true },
        { label: "Reminders & Meetings", included: true },
        { label: "Notes & Calendar", included: true },
        { label: "Customer Management", included: true },
        { label: "Advanced Reports", included: true },
        { label: "Invoice Management", included: true },
        { label: "HR Management", included: true },
        { label: "HR Operations (Payroll)", included: true },
        { label: "Advanced Analytics", included: true },
      ],
    },
  ],
  USD: [
    {
      id: "gold",
      name: "Gold",
      priceRaw: 33,
      price: "$33",
      period: "Year",
      staff: 3,
      features: [
        { label: "Lead Management", included: true },
        { label: "Task Management", included: true },
        { label: "Reminders & Meetings", included: true },
        { label: "Notes & Calendar", included: true },
        { label: "Customer Management", included: true },
        { label: "Basic Reports", included: true },
        { label: "Invoice Management", included: false },
        { label: "HR Management", included: false },
        { label: "HR Operations (Payroll)", included: false },
        { label: "Advanced Analytics", included: false },
      ],
    },
    {
      id: "diamond",
      name: "Diamond",
      priceRaw: 52,
      price: "$52",
      period: "Year",
      staff: 5,
      features: [
        { label: "Lead Management", included: true },
        { label: "Task Management", included: true },
        { label: "Reminders & Meetings", included: true },
        { label: "Notes & Calendar", included: true },
        { label: "Customer Management", included: true },
        { label: "Advanced Reports", included: true },
        { label: "Invoice Management", included: true },
        { label: "HR Management", included: false },
        { label: "HR Operations (Payroll)", included: false },
        { label: "Advanced Analytics", included: false },
      ],
    },
    {
      id: "platinum",
      name: "Platinum",
      priceRaw: 94,
      price: "$94",
      period: "Year",
      staff: 8,
      features: [
        { label: "Lead Management", included: true },
        { label: "Task Management", included: true },
        { label: "Reminders & Meetings", included: true },
        { label: "Notes & Calendar", included: true },
        { label: "Customer Management", included: true },
        { label: "Advanced Reports", included: true },
        { label: "Invoice Management", included: true },
        { label: "HR Management", included: true },
        { label: "HR Operations (Payroll)", included: true },
        { label: "Advanced Analytics", included: true },
      ],
    },
  ],
};

const ADDONS = {
  INR: [
    { id: "staff", name: "Staff", period: "Per User For 1 Year", price: "₹365", priceRaw: 365, icon: "fas fa-users" },
    { id: "accounting", name: "Accounting", period: "Per Branch For 1 Year", price: "₹2500", priceRaw: 2500, icon: "fas fa-calculator" },
    { id: "indiamart", name: "India Mart", period: "For 1 Year", price: "₹1000", priceRaw: 1000, icon: "fas fa-store" },
    { id: "tradeindia", name: "Trade India", period: "For 1 Year", price: "₹1000", priceRaw: 1000, icon: "fas fa-handshake" },
    { id: "justdial", name: "Just Dial", period: "For 1 Year", price: "₹1000", priceRaw: 1000, icon: "fas fa-phone-alt" },
    { id: "whatsapp", name: "WhatsApp", period: "Per Number For 1 Year", price: "₹1500", priceRaw: 1500, icon: "fab fa-whatsapp" },
    { id: "sms", name: "SMS Gateway", period: "For 1 Year", price: "₹500", priceRaw: 500, icon: "fas fa-sms" },
    { id: "email", name: "Email Campaign", period: "For 1 Year", price: "₹800", priceRaw: 800, icon: "fas fa-envelope" },
  ],
  USD: [
    { id: "staff", name: "Staff", period: "Per User For 1 Year", price: "$4", priceRaw: 4, icon: "fas fa-users" },
    { id: "accounting", name: "Accounting", period: "Per Branch For 1 Year", price: "$30", priceRaw: 30, icon: "fas fa-calculator" },
    { id: "indiamart", name: "India Mart", period: "For 1 Year", price: "$12", priceRaw: 12, icon: "fas fa-store" },
    { id: "tradeindia", name: "Trade India", period: "For 1 Year", price: "$12", priceRaw: 12, icon: "fas fa-handshake" },
    { id: "justdial", name: "Just Dial", period: "For 1 Year", price: "$12", priceRaw: 12, icon: "fas fa-phone-alt" },
    { id: "whatsapp", name: "WhatsApp", period: "Per Number For 1 Year", price: "$18", priceRaw: 18, icon: "fab fa-whatsapp" },
    { id: "sms", name: "SMS Gateway", period: "For 1 Year", price: "$6", priceRaw: 6, icon: "fas fa-sms" },
    { id: "email", name: "Email Campaign", period: "For 1 Year", price: "$10", priceRaw: 10, icon: "fas fa-envelope" },
  ],
};

export default function AddPackagePage() {
  const { getToken, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [currency, setCurrency] = useState("INR");
  const [cart, setCart] = useState({ plan: null, addons: [], currency: "INR" });
  const [expandedCards, setExpandedCards] = useState({});
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [activePlanName, setActivePlanName] = useState("Gold");
  const [showCartModal, setShowCartModal] = useState(false);

  // Renew plan modal state
  const [renewModalPlan, setRenewModalPlan] = useState(null); // the plan being renewed
  const [modalSelectedAddons, setModalSelectedAddons] = useState([]); // addon ids selected inside modal

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("rnd_cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
  }, []);

  // Sync cart currency when currency changes
  useEffect(() => {
    setCart((prev) => {
      const updated = { ...prev, currency };
      localStorage.setItem("rnd_cart", JSON.stringify(updated));
      return updated;
    });
  }, [currency]);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    async function fetchStatus() {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.orders?.length > 0) {
          const latest = data.orders[0];
          const status = latest.status || "active";
          setSubscriptionStatus(status);
          setActivePlanName(latest.plan_name || "Gold");
          // Auto-redirect subscribed/trial users to dashboard
          if (status === "active" || status === "trial") {
            router.replace("/dashboard");
          }
        } else {
          setSubscriptionStatus("none");
        }
      } catch {
        setSubscriptionStatus("none");
      }
    }
    fetchStatus();
  }, [isLoaded, userId, router, getToken]);

  const plans = PLANS[currency];
  const addons = ADDONS[currency];
  const cartCount = (cart.plan ? 1 : 0) + cart.addons.length;
  const selectedPlanId = cart.plan?.id;

  const toggleExpand = (planId) => {
    setExpandedCards((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  const toggleAddon = (addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    setCart((prev) => {
      let updated;
      if (prev.addons.some((a) => a.id === addonId)) {
        updated = { ...prev, addons: prev.addons.filter((a) => a.id !== addonId) };
      } else {
        updated = { ...prev, addons: [...prev.addons, addon] };
      }
      localStorage.setItem("rnd_cart", JSON.stringify(updated));
      return updated;
    });
  };

  // Open renew modal for a plan
  const handleRenewPlan = (plan) => {
    setRenewModalPlan(plan);
    setModalSelectedAddons([]);
  };

  // Toggle addon inside the renew modal
  const toggleModalAddon = (addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    setModalSelectedAddons((prev) =>
      prev.some((a) => a.id === addonId)
        ? prev.filter((a) => a.id !== addonId)
        : [...prev, addon]
    );
  };

  // Confirm: add plan + selected addons to cart, close modal
  const handleModalAddToCart = () => {
    const planObj = PLANS[currency].find((p) => p.id === renewModalPlan.id);
    setCart((prev) => {
      const updated = {
        ...prev,
        plan: planObj,
        addons: modalSelectedAddons,
        currency,
      };
      localStorage.setItem("rnd_cart", JSON.stringify(updated));
      return updated;
    });
    setRenewModalPlan(null);
    setModalSelectedAddons([]);
  };

  const closeRenewModal = () => {
    setRenewModalPlan(null);
    setModalSelectedAddons([]);
  };

  const getStatusLabel = () => {
    if (!subscriptionStatus || subscriptionStatus === "none") return null;
    if (subscriptionStatus === "trial_expired" || subscriptionStatus === "expired") {
      return { text: `${activePlanName} Free Trial : Package Expired`, action: "click to upgrade", color: "#e74c3c" };
    }
    if (subscriptionStatus === "trial") {
      return { text: `${activePlanName} Free Trial : Active`, action: "upgrade anytime", color: "#f5a623" };
    }
    if (subscriptionStatus === "active") {
      return { text: `${activePlanName} : Active`, action: "renew or upgrade", color: "#27ae60" };
    }
    return null;
  };

  const statusInfo = getStatusLabel();

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Renew Packages &amp; Addon Service</h1>
        </div>
        <div className={styles.controls}>
          <div className={styles.currencyToggle}>
            <button
              className={`${styles.currBtn} ${currency === "INR" ? styles.currActive : ""}`}
              onClick={() => setCurrency("INR")}
            >INR</button>
            <button
              className={`${styles.currBtn} ${currency === "USD" ? styles.currActive : ""}`}
              onClick={() => setCurrency("USD")}
            >USD</button>
          </div>
          <button className={styles.cartBtn} onClick={() => setShowCartModal(true)}>
            <i className="fas fa-shopping-cart" style={{ fontSize: "16px", color: "#ffffff" }} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* ── Plans Section Header ── */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>✨</span>
        <span className={styles.sectionTitle}>365 Packages</span>
        <span className={styles.sectionIcon}>✨</span>
      </div>

      {/* ── Plan Cards ── */}
      <div className={styles.planGrid}>
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const isExpanded = expandedCards[plan.id];
          return (
            <div
              key={plan.id}
              className={`${styles.planCard} ${isSelected ? styles.planSelected : ""}`}
            >
              <div className={styles.planTop}>
                <span className={styles.planName}>{plan.name}</span>
                <span className={styles.trialBadge}>7-day trial</span>
              </div>

              <div className={styles.planPrice}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span className={styles.priceAmount}>{plan.price}</span>
                  <span className={styles.pricePer}>/ {plan.period}</span>
                </div>
                <p className={styles.planTax}>Excluding TAX • Billed in Indian Rupees</p>
              </div>

              <p className={styles.planStaff}>Includes {plan.staff} staff members</p>

              <button
                className={`${styles.planBtn} ${isSelected ? styles.planBtnSelected : ""}`}
                onClick={() => handleRenewPlan(plan)}
              >
                {isSelected ? (
                  <><i className="fas fa-check" style={{ marginRight: 6 }} />Selected</>
                ) : (
                  "Renew Plan"
                )}
              </button>

              {isExpanded && (
                <div className={styles.featureList}>
                  {plan.features.map((f) => (
                    <div key={f.label} className={styles.featureItem}>
                      <span className={f.included ? styles.featCheck : styles.featCross}>
                        <i className={`fas ${f.included ? "fa-check" : "fa-times"}`} />
                      </span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className={styles.expandTrigger}
                onClick={() => toggleExpand(plan.id)}
                aria-label="Toggle features"
              >
                <i className={`fas fa-chevron-down ${styles.expandIcon} ${isExpanded ? styles.rotated : ""}`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Addons Section Header ── */}
      <div className={styles.sectionHeader} style={{ marginTop: 56 }}>
        <span className={styles.sectionIcon}>✨</span>
        <span className={styles.sectionTitle}>365 Addon Services</span>
        <span className={styles.sectionIcon}>✨</span>
      </div>

      {/* ── Addon Cards ── */}
      <div className={styles.addonGrid}>
        {addons.map((addon) => (
          <div
            key={addon.id}
            className={`${styles.addonCard} ${cart.addons.some((a) => a.id === addon.id) ? styles.addonInCart : ""}`}
          >
            <div className={styles.addonTop}>
              <div className={styles.addonIconBox}>
                <i className={addon.icon} />
              </div>
              <div className={styles.addonInfo}>
                <span className={styles.addonName}>{addon.name}</span>
                <span className={styles.addonPeriod}>{addon.period}</span>
              </div>
            </div>
            <div className={styles.addonBottom}>
              <span className={styles.addonPrice}>{addon.price}</span>
              <button
                className={`${styles.addonBtn} ${cart.addons.some((a) => a.id === addon.id) ? styles.addonBtnRemove : ""}`}
                onClick={() => toggleAddon(addon.id)}
              >
                {cart.addons.some((a) => a.id === addon.id) ? "Remove" : "Add To Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Floating Cart ── */}
      {cartCount > 0 && (
        <div className={styles.floatingCart}>
          <span>
            <i className="fas fa-shopping-cart" style={{ marginRight: 8 }} />
            {cartCount} item{cartCount > 1 ? "s" : ""} in cart
          </span>
          <button onClick={() => router.push("/cart")}>Proceed to Checkout</button>
        </div>
      )}

      {/* ── Cart Preview Modal ── */}
      {showCartModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCartModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>Your Cart</h2>
              <button className={styles.modalClose} onClick={() => setShowCartModal(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            {cartCount === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14, padding: "24px 0" }}>Your cart is empty.</p>
            ) : (
              <>
                {cart.plan && (
                  <div className={styles.modalAddonCard}>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>
                      {cart.plan.name} Plan
                    </strong>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {cart.plan.price} / Year
                    </span>
                  </div>
                )}
                {cart.addons.map((addon) => (
                  <div key={addon.id} className={styles.modalAddonCard}>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: 14 }}>{addon.name}</strong>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{addon.price}</span>
                  </div>
                ))}
              </>
            )}
            <div className={styles.modalActions}>
              <button className={styles.secondaryBtn} onClick={() => setShowCartModal(false)}>Close</button>
              {cartCount > 0 && (
                <button className={styles.primaryBtn} onClick={() => router.push("/cart")}>Checkout</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Renew Plan Modal (matches screenshot) ── */}
      {renewModalPlan && (
        <div className={styles.modalOverlay} onClick={closeRenewModal}>
          <div className={styles.renewModalContent} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header — dark purple */}
            <div className={styles.renewModalHeader}>
              <h2 className={styles.renewModalTitle}>Package Renew Details</h2>
              <button className={styles.renewModalClose} onClick={closeRenewModal}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.renewModalBody}>
              {/* Selected plan summary */}
              <div className={styles.renewPlanSummary}>
                <span className={styles.renewPlanLabel}>{renewModalPlan.name} Plan</span>
                <span className={styles.renewPlanPrice}>{renewModalPlan.price} / Year</span>
              </div>

              <p className={styles.renewAddonHeading}>Renew Addon Services</p>

              <div className={styles.renewAddonGrid}>
                {addons.map((addon) => {
                  const isSelected = modalSelectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      className={`${styles.renewAddonCard} ${isSelected ? styles.renewAddonSelected : ""}`}
                      onClick={() => toggleModalAddon(addon.id)}
                    >
                      {/* Selected checkmark badge */}
                      {isSelected && (
                        <div className={styles.renewCheckBadge}>
                          <i className="fas fa-check" />
                        </div>
                      )}

                      <div className={styles.renewAddonTop}>
                        <div className={styles.renewAddonIcon}>
                          <i className={addon.icon} />
                        </div>
                        <div className={styles.renewAddonInfo}>
                          <span className={styles.renewAddonName}>{addon.name}</span>
                          <span className={styles.renewAddonPeriod}>{addon.period}</span>
                        </div>
                      </div>

                      <div className={styles.renewAddonBottom}>
                        <span className={styles.renewAddonPrice}>{addon.price}</span>
                        <button
                          className={`${styles.renewSelectBtn} ${isSelected ? styles.renewSelectBtnActive : ""}`}
                          onClick={(e) => { e.stopPropagation(); toggleModalAddon(addon.id); }}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.renewModalFooter}>
              <button className={styles.secondaryBtn} onClick={closeRenewModal}>Cancel</button>
              <button className={styles.renewAddToCartBtn} onClick={handleModalAddToCart}>
                <i className="fas fa-shopping-cart" style={{ marginRight: 8 }} />
                Add to Cart
                {modalSelectedAddons.length > 0 && (
                  <span className={styles.renewCartCount}>{modalSelectedAddons.length + 1}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className={styles.pageFooter}>
        <p className={styles.copyright}>COPYRIGHT © 2026 RND TECHNOSOFT CRM, All rights reserved</p>
      </div>

      {/* ── Status Bar ── */}
      {statusInfo && (
        <div className={styles.statusBar}>
          <span style={{ color: statusInfo.color, fontWeight: 700 }}>{statusInfo.text}</span>
          <span
            className={styles.statusAction}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {statusInfo.action}
          </span>
        </div>
      )}
    </div>
  );
}