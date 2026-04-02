"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import styles from "./page.module.css";

const GST_RATE = 0.18;
const SYMBOL = { INR: "₹", USD: "$" };

export default function CartPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [cart, setCart] = useState({ plan: null, addons: [], currency: "INR" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("rnd_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const sym = SYMBOL[cart.currency] || "₹";
  const planPrice = cart.plan?.price || 0;
  const addonsTotal = cart.addons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = planPrice + addonsTotal;
  const gst = +(subtotal * GST_RATE).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const removeAddon = (id) => {
    const updated = { ...cart, addons: cart.addons.filter((a) => a.id !== id) };
    setCart(updated);
    localStorage.setItem("rnd_cart", JSON.stringify(updated));
  };

  const removePlan = () => {
    const updated = { ...cart, plan: null };
    setCart(updated);
    localStorage.setItem("rnd_cart", JSON.stringify(updated));
  };

  const handleOrder = async () => {
    if (!cart.plan && cart.addons.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_name: cart.plan?.name || null,
          package_price: planPrice,
          currency: cart.currency,
          addons: cart.addons,
          subtotal,
          gst,
          total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        localStorage.removeItem("rnd_cart");
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !cart.plan && cart.addons.length === 0;

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✅</div>
          <h2>Order Placed Successfully!</h2>
          <p>Our team will contact you within 24 hours to complete the process.</p>
          <button onClick={() => router.push("/add-package")} className={styles.backBtn}>
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backLink} onClick={() => router.push("/add-package")}>
          &laquo; Back to Package
        </button>
        <h1 className={styles.title}>Review Your Order</h1>
        <p className={styles.subtitle}>Please review your selected package and addon services</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.itemsPanel}>
          {isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🙁</div>
              <p>Sorry, Your Cart is Empty</p>
            </div>
          ) : (
            <>
              {cart.plan && (
                <div className={styles.cartItem}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemIcon}>📦</span>
                    <div>
                      <p className={styles.itemName}>{cart.plan.name} Package</p>
                      <p className={styles.itemMeta}>Yearly Plan • {cart.plan.staff} Staff Members</p>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>{sym}{cart.plan.price.toLocaleString()}</span>
                    <button className={styles.removeBtn} onClick={removePlan}>✕</button>
                  </div>
                </div>
              )}
              {cart.addons.map((addon) => (
                <div key={addon.id} className={styles.cartItem}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemIcon}>🔧</span>
                    <div>
                      <p className={styles.itemName}>{addon.name}</p>
                      <p className={styles.itemMeta}>{addon.desc}</p>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>{sym}{addon.price.toLocaleString()}</span>
                    <button className={styles.removeBtn} onClick={() => removeAddon(addon.id)}>✕</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className={styles.summaryPanel}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          <div className={styles.summaryRow}>
            <span>Package Charges:</span>
            <span>{sym}{planPrice.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Addon Services:</span>
            <span>{sym}{addonsTotal.toLocaleString()}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.summaryRow}>
            <span>Billing:</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{sym}{subtotal.toLocaleString()}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>GST (18%)</span>
            <span>{sym}{gst.toLocaleString()}</span>
          </div>
          <div className={styles.divider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total:</span>
            <span>{sym}{total.toLocaleString()}</span>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
          <button
            className={styles.payBtn}
            onClick={handleOrder}
            disabled={loading || isEmpty}
          >
            {loading ? "Placing Order..." : "Process to Payment →"}
          </button>
        </div>
      </div>
    </div>
  );
}