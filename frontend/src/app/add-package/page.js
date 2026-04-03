"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import styles from "./page.module.css";

const ALL_FEATURES = [
  { id: "whatsapp_click", label: "Click To WhatsApp" },
  { id: "staff_count", label: "Number of Staff" },
  { id: "lead", label: "Lead" },
  { id: "task", label: "Task" },
  { id: "reminder", label: "Reminder" },
  { id: "customer", label: "Customer" },
  { id: "meeting", label: "Meeting" },
  { id: "chat", label: "Chat" },
  { id: "attendance", label: "Attendance" },
  { id: "invoice", label: "Invoice" },
  { id: "leave", label: "Staff Leave" },
  { id: "calendar", label: "Calendar" },
  { id: "notes", label: "Notes" },
  { id: "holidays", label: "Holidays" },
  { id: "templates", label: "Templates" },
  { id: "todo", label: "ToDo" },
  { id: "automations", label: "Automations Rules" },
  { id: "sms_int", label: "SMS Integration" },
  { id: "email_int", label: "Email Integration" },
  { id: "wa_int", label: "WhatsApp Integration" },
  { id: "web_lead", label: "Website Lead" },
  { id: "fb_lead", label: "Facebook Lead" },
  { id: "campaign", label: "Campaign" },
  { id: "dynamic_fields", label: "Lead Dynamic Fields" },
  { id: "dept", label: "Department" },
  { id: "greetings", label: "Greetings" },
  { id: "indiamart", label: "IndiaMart Lead" },
  { id: "tradeindia", label: "TradeIndia Lead" },
  { id: "gform", label: "Google Form Lead" },
  { id: "face_att", label: "face attendance" },
  { id: "acres99", label: "99 Acres Integration" },
  { id: "softsuggest", label: "Software Suggest Integration" },
  { id: "systemio", label: "System IO Integration" },
  { id: "justdial", label: "JustDial Integration" },
  { id: "magicbricks", label: "MagicBricks Integration" },
  { id: "gads", label: "Google Ads Lead Integration" },
  { id: "wp_int", label: "WordPress Integration" },
  { id: "gcal", label: "Google Calendar Integration" },
  { id: "wa_meta", label: "Whatsapp Meta Integration" },
  { id: "housing", label: "Housing Integration" },
  { id: "staff_target", label: "Staff Target" },
  { id: "service", label: "Service" },
  { id: "lead_attach", label: "Lead Attachment" },
  { id: "hiring", label: "Hiring Module" },
  { id: "chat_supp", label: "Chat Support" },
  { id: "call_supp", label: "Call Support" },
  { id: "storage", label: "Storage" },
];

const PACKAGES = {
  INR: [
    { id: "gold", name: "Gold", price: 2750, staff: 3, storage: 500, included: ["whatsapp_click", "staff_count", "lead", "task", "reminder", "customer", "meeting", "chat", "invoice", "leave", "calendar", "notes", "holidays", "templates", "automations", "wa_int", "chat_supp", "storage"] },
    { id: "diamond", name: "Diamond", price: 4350, staff: 5, storage: 1024, included: ["whatsapp_click", "staff_count", "lead", "task", "reminder", "customer", "meeting", "chat", "attendance", "invoice", "leave", "calendar", "notes", "holidays", "templates", "todo", "automations", "sms_int", "wa_int", "web_lead", "fb_lead", "campaign", "dynamic_fields", "dept", "greetings", "chat_supp", "storage"] },
    { id: "platinum", name: "Platinum", price: 7800, staff: 8, storage: 2048, included: ALL_FEATURES.map(f => f.id).filter(id => id !== "face_att") },
  ],
  USD: [
    { id: "gold", name: "Gold", price: 33, staff: 3, storage: 500, included: ["whatsapp_click", "staff_count", "lead", "storage"] },
    { id: "diamond", name: "Diamond", price: 52, staff: 5, storage: 1024, included: ["whatsapp_click", "staff_count", "lead", "storage"] },
    { id: "platinum", name: "Platinum", price: 94, staff: 8, storage: 2048, included: ALL_FEATURES.map(f => f.id) },
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
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  const [currency, setCurrency] = useState("INR");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState(null);
  const [modalAddons, setModalAddons] = useState([]);
  const [cartAddons, setCartAddons] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    const checkSubscription = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const hasSubscription = data.success && Array.isArray(data.orders) && data.orders.length > 0;
        if (hasSubscription) {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Failed to verify subscription", err);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isLoaded, isSignedIn, getToken, router]);

  useEffect(() => {
    const saved = localStorage.getItem("rnd_cart");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedPlan(parsed.plan || null);
      setCartAddons(parsed.addons || []);
      setModalAddons(parsed.addons || []);
      setCurrency(parsed.currency || "INR");
    }
  }, []);

  const openPlanModal = (pkg) => {
    setModalPlan({ ...pkg, currency });
    setModalAddons(cartAddons);
    setModalOpen(true);
  };

  const closePlanModal = () => {
    setModalOpen(false);
    setModalPlan(null);
  };

  const savePlanModal = () => {
    if (modalPlan) {
      setSelectedPlan(modalPlan);
      setCartAddons(modalAddons);
      localStorage.setItem("rnd_cart", JSON.stringify({ plan: modalPlan, addons: modalAddons, currency }));
    }
    closePlanModal();
    router.push("/cart");
  };

  const toggleModalAddon = (addon) => {
    setModalAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  useEffect(() => {
    const count = (selectedPlan ? 1 : 0) + cartAddons.length;
    setCartCount(count);
    localStorage.setItem("rnd_cart", JSON.stringify({ plan: selectedPlan, addons: cartAddons, currency }));
  }, [selectedPlan, cartAddons, currency]);

  if (!isLoaded || !isSignedIn || checkingSubscription) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  const toggleAddon = (addon) => {
    setCartAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const sym = SYMBOL[currency];
  const packages = PACKAGES[currency];
  const addons = ADDONS[currency];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Renew Packages & Addon Service</h1>
        <div className={styles.controls}>
          <div className={styles.currencyToggle}>
            <button className={`${styles.currBtn} ${currency === "INR" ? styles.currActive : ""}`} onClick={() => setCurrency("INR")}>INR</button>
            <button className={`${styles.currBtn} ${currency === "USD" ? styles.currActive : ""}`} onClick={() => setCurrency("USD")}>USD</button>
          </div>
          <button className={styles.cartBtn} onClick={() => router.push("/cart")}>
            🛒 {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🚀 365 Packages 🚀</h2>
        <div className={styles.planGrid}>
          {packages.map((pkg) => {
            const isSelected = selectedPlan?.id === pkg.id;
            const isExpanded = expandedPlan === pkg.id;

            return (
              <div key={pkg.id} className={`${styles.planCard} ${isSelected ? styles.planSelected : ""}`}>
                <div className={styles.planTop}>
                  <span className={styles.planName}>{pkg.name}</span>
                  <span className={styles.trialBadge}>7-day trial</span>
                </div>
                
                <div className={styles.planPrice}>
                  <span className={styles.priceAmount}>{sym}{pkg.price.toLocaleString()}</span>
                  <span className={styles.pricePer}> / Year</span>
                </div>
                <p className={styles.planTax}>Excluding TAX • Billed in {currency === "INR" ? "Indian Rupees" : "US Dollars"}</p>

                <p className={styles.planStaff}>Includes {pkg.staff} staff members</p>
                
                <button 
                  className={`${styles.planBtn} ${isSelected ? styles.planBtnSelected : ""}`}
                  onClick={() => {
                    if (isSelected) {
                      openPlanModal(pkg);
                    } else {
                      setSelectedPlan({ ...pkg, currency });
                    }
                  }}
                >
                  {isSelected ? "Selected Plan" : "Renew Plan"}
                </button>

                {/* Only one plan expands at a time */}
                <div 
                  className={styles.expandTrigger} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedPlan((prev) => (prev === pkg.id ? null : pkg.id));
                  }}
                >
                   <div className={`${styles.expandIcon} ${isExpanded ? styles.rotated : ""}`}>
                    ⌄
                   </div>
                </div>

                {isExpanded && (
                  <div className={styles.featureList}>
                    {ALL_FEATURES.map((feature) => {
                      const isIncluded = pkg.included.includes(feature.id);
                      let label = feature.label;
                      if (feature.id === "staff_count") label = `Number of Staff: ${pkg.staff}`;
                      if (feature.id === "storage") label = `Storage: ${pkg.storage}`;

                      return (
                        <div key={feature.id} className={styles.featureItem}>
                          <span className={isIncluded ? styles.featCheck : styles.featCross}>
                            {isIncluded ? "✓" : "✕"}
                          </span>
                          <span className={styles.featLabel}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {modalOpen && modalPlan && (
        <div className={styles.modalOverlay} onClick={closePlanModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Package Renew Details</h2>
              <button className={styles.modalClose} onClick={closePlanModal}>✕</button>
            </div>
            <p className={styles.modalDesc}>Renew Addon Services and confirm package details</p>
            <div className={styles.modalPlanInfo}>
              <p><strong>{modalPlan.name} Package</strong> • {modalPlan.staff} staff • {sym}{modalPlan.price} / year</p>
            </div>
            <div className={styles.modalSectionTitle}>Included Features</div>
            <div className={styles.modalFeatureList}>
              {ALL_FEATURES.map((feature) => {
                const included = modalPlan.included.includes(feature.id);
                return (
                  <div key={feature.id} className={styles.featureItem}>
                    <span className={included ? styles.featCheck : styles.featCross}>{included ? "✓" : "✕"}</span>
                    <span className={styles.featLabel}>{feature.label}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.modalSectionTitle}>Addon Services</div>
            <div className={styles.modalAddonGrid}>
              {addons.map((addon) => {
                const selected = modalAddons.some((a) => a.id === addon.id);
                return (
                  <div 
  key={addon.id} 
  className={`${styles.modalAddonCard} ${selected ? styles.addonInCart : ""}`} 
  onClick={() => toggleModalAddon(addon)}
>
  <div className={styles.addonInfo}>
    <p className={styles.addonName}>{addon.name}</p>
    <p className={styles.addonDesc}>{addon.desc}</p>
  </div>

  <div className={styles.addonMeta}>
    <span className={styles.addonPrice}>{sym}{addon.price}</span>
    <button className={`${styles.addonBtn} ${selected ? styles.addonBtnRemove : ""}`}>
      {selected ? "Selected" : "Select"}
    </button>
  </div>
</div>
                );
              })}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.primaryBtn} onClick={savePlanModal}>Add to Cart</button>
              <button className={styles.secondaryBtn} onClick={closePlanModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🚀 365 Addon Services 🚀</h2>
        <div className={styles.addonGrid}>
          {addons.map((addon) => {
            const inCart = cartAddons.some((a) => a.id === addon.id);
            return (
              <div key={addon.id} className={`${styles.addonCard} ${inCart ? styles.addonInCart : ""}`} onClick={() => toggleAddon({ ...addon, currency })}>
                <div className={styles.addonIcon}>📦</div>
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