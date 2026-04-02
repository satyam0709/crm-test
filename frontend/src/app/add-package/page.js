"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import styles from "./page.module.css";

const PACKAGES = {
  INR: [
    { id: "gold", name: "Gold", price: 2750, staff: 3, trial: "7-day trial" },
    { id: "diamond", name: "Diamond", price: 4350, staff: 5, trial: "7-day trial" },
    { id: "platinum", name: "Platinum", price: 7800, staff: 8, trial: "7-day trial" },
  ],
  USD: [
    { id: "gold", name: "Gold", price: 33, staff: 3, trial: "7-day trial" },
    { id: "diamond", name: "Diamond", price: 52, staff: 5, trial: "7-day trial" },
    { id: "platinum", name: "Platinum", price: 94, staff: 8, trial: "7-day trial" },
  ],
};

const ADDONS = {
  INR: [
    { id: "staff", name: "Staff", desc: "Per User For 1 Year", price: 365 },
    { id: "accounting", name: "Accounting", desc: "Per Branch For 1 Year", price: 2500 },
    { id: "indiamart", name: "India Mart", desc: "For 1 Year", price: 1000 },
    { id: "tradeindia", name: "Trade India", desc: "For 1 Year", price: 1000 },
    { id: "googleform", name: "Google Form", desc: "For 1 Year", price: 1000 },
    { id: "99acres", name: "99 Acres", desc: "For 1 Year", price: 1000 },
    { id: "softsuggest", name: "Software Suggest", desc: "For 1 Year", price: 1000 },
    { id: "justdial", name: "Just Dial", desc: "For 1 Year", price: 1000 },
    { id: "magicbricks", name: "Magicbricks", desc: "For 1 Year", price: 1000 },
    { id: "googleads", name: "Google Ads Lead From Assets", desc: "For 1 Year", price: 1000 },
    { id: "wordpress", name: "WordPress Integration", desc: "For 1 Year", price: 1000 },
    { id: "stafftarget", name: "Staff Target", desc: "For 1 Year", price: 1000 },
    { id: "gcal", name: "Google Calendar Integration", desc: "For 1 Year", price: 1000 },
    { id: "housing", name: "Housing", desc: "For 1 Year", price: 1000 },
    { id: "systemeio", name: "Systeme.io", desc: "For 1 Year", price: 1000 },
    { id: "service", name: "Service", desc: "For 1 Year", price: 1000 },
    { id: "hiring", name: "Hiring Module", desc: "For 1 Year", price: 1500 },
    { id: "storage", name: "Storage", desc: "1024 MB", price: 500 },
    { id: "leadattach", name: "Lead Attachment", desc: "For 1 Year", price: 1000 },
    { id: "faceattend", name: "Face Attendance", desc: "For 1 Year", price: 2500 },
    { id: "maptrack", name: "Map Tracking", desc: "Per User For 1 Year", price: 1000 },
    { id: "empmonitor", name: "365 Employee Monitoring System", desc: "Per User For 1 Year", price: 500 },
    { id: "pabbly", name: "Connect With Pabbly", desc: "For 1 Year", price: 1500 },
  ],
  USD: [
    { id: "staff", name: "Staff", desc: "Per User For 1 Year", price: 5 },
    { id: "accounting", name: "Accounting", desc: "Per Branch For 1 Year", price: 30 },
    { id: "indiamart", name: "India Mart", desc: "For 1 Year", price: 12 },
    { id: "tradeindia", name: "Trade India", desc: "For 1 Year", price: 12 },
    { id: "googleform", name: "Google Form", desc: "For 1 Year", price: 12 },
    { id: "99acres", name: "99 Acres", desc: "For 1 Year", price: 12 },
    { id: "softsuggest", name: "Software Suggest", desc: "For 1 Year", price: 12 },
    { id: "justdial", name: "Just Dial", desc: "For 1 Year", price: 12 },
    { id: "magicbricks", name: "Magicbricks", desc: "For 1 Year", price: 12 },
    { id: "googleads", name: "Google Ads Lead From Assets", desc: "For 1 Year", price: 12 },
    { id: "wordpress", name: "WordPress Integration", desc: "For 1 Year", price: 12 },
    { id: "stafftarget", name: "Staff Target", desc: "For 1 Year", price: 12 },
    { id: "gcal", name: "Google Calendar Integration", desc: "For 1 Year", price: 12 },
    { id: "housing", name: "Housing", desc: "For 1 Year", price: 12 },
    { id: "systemeio", name: "Systeme.io", desc: "For 1 Year", price: 12 },
    { id: "service", name: "Service", desc: "For 1 Year", price: 12 },
    { id: "hiring", name: "Hiring Module", desc: "For 1 Year", price: 18 },
    { id: "storage", name: "Storage", desc: "1024 MB", price: 6 },
    { id: "leadattach", name: "Lead Attachment", desc: "For 1 Year", price: 12 },
    { id: "faceattend", name: "Face Attendance", desc: "For 1 Year", price: 30 },
    { id: "maptrack", name: "Map Tracking", desc: "Per User For 1 Year", price: 12 },
    { id: "empmonitor", name: "365 Employee Monitoring System", desc: "Per User For 1 Year", price: 6 },
    { id: "pabbly", name: "Connect With Pabbly", desc: "For 1 Year", price: 18 },
  ],
};

const SYMBOL = { INR: "₹", USD: "$" };

export default function AddPackagePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [currency, setCurrency] = useState("INR");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cartAddons, setCartAddons] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("rnd_cart");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedPlan(parsed.plan || null);
      setCartAddons(parsed.addons || []);
      setCurrency(parsed.currency || "INR");
    }
  }, []);

  useEffect(() => {
    const count = (selectedPlan ? 1 : 0) + cartAddons.length;
    setCartCount(count);
    localStorage.setItem("rnd_cart", JSON.stringify({
      plan: selectedPlan,
      addons: cartAddons,
      currency,
    }));
  }, [selectedPlan, cartAddons, currency]);

  const toggleAddon = (addon) => {
    setCartAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const isAddonInCart = (id) => cartAddons.some((a) => a.id === id);

  const sym = SYMBOL[currency];
  const packages = PACKAGES[currency];
  const addons = ADDONS[currency];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Renew Packages &amp; Addon Service</h1>
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
          <button className={styles.cartBtn} onClick={() => router.push("/cart")}>
            🛒
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>✨ 365 Packages ✨</h2>
        <div className={styles.planGrid}>
          {packages.map((pkg) => {
            const isSelected = selectedPlan?.id === pkg.id;
            return (
              <div key={pkg.id} className={`${styles.planCard} ${isSelected ? styles.planSelected : ""}`}>
                <div className={styles.planTop}>
                  <span className={styles.planName}>{pkg.name}</span>
                  <span className={styles.trialBadge}>{pkg.trial}</span>
                </div>
                <div className={styles.planPrice}>
                  <span className={styles.priceAmount}>{sym}{pkg.price.toLocaleString()}</span>
                  <span className={styles.pricePer}> / Year</span>
                </div>
                <p className={styles.planTax}>Excluding TAX • Billed in {currency === "INR" ? "Indian Rupees" : "US Dollars"}</p>
                <p className={styles.planStaff}>Includes {pkg.staff} staff members</p>
                <button
                  className={`${styles.planBtn} ${isSelected ? styles.planBtnSelected : ""}`}
                  onClick={() => setSelectedPlan(isSelected ? null : { ...pkg, currency })}
                >
                  {isSelected ? "Selected Plan" : "Select Plan"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>✨ 365 Addon Services ✨</h2>
        <div className={styles.addonGrid}>
          {addons.map((addon) => {
            const inCart = isAddonInCart(addon.id);
            return (
              <div
                key={addon.id}
                className={`${styles.addonCard} ${inCart ? styles.addonInCart : ""}`}
                onClick={() => toggleAddon({ ...addon, currency })}
              >
                <div className={styles.addonIcon}>
                  <i className="fas fa-box" />
                </div>
                <div className={styles.addonInfo}>
                  <p className={styles.addonName}>{addon.name}</p>
                  <p className={styles.addonDesc}>{addon.desc}</p>
                  <p className={styles.addonPrice}>{sym}{addon.price.toLocaleString()}</p>
                </div>
                <button className={`${styles.addonBtn} ${inCart ? styles.addonBtnRemove : ""}`}>
                  {inCart ? "Remove" : "Add To Cart"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {cartCount > 0 && (
        <div className={styles.floatingCart}>
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <button onClick={() => router.push("/cart")}>Review Order →</button>
        </div>
      )}
    </div>
  );
}