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
  const planPrice = Number(cart.plan?.price) || 0;
  const addonsTotal = cart.addons.reduce(
  (sum, a) => sum + Number(a.price || 0),
  0
);
  const subtotal = planPrice + addonsTotal;
  const gst = +(subtotal * GST_RATE).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  const totalItems = (cart.plan ? 1 : 0) + cart.addons.length;

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
      setError("Your cart is empty. Please add a plan or addon to proceed.");
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
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to place order. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = !cart.plan && cart.addons.length === 0;

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successBox}>
          <div className={styles.successRing}>✅</div>
          <h2>Order Placed Successfully!</h2>
          <p>
            Thank you for your order. Our team will contact you within 24 hours
            to complete the onboarding process.
          </p>
          <button onClick={() => router.push("/add-package")} className={styles.backBtn}>
            <i className="fas fa-arrow-left" />
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.backLink} onClick={() => router.push("/add-package")}>
          <i className="fas fa-arrow-left" />
          Back to Packages
        </button>
        <div>
          <div className={styles.stepIndicator}>
            <span className={styles.stepDot} />
            <span className={styles.stepText}>Step 2 of 3 — Review Order</span>
          </div>
        </div>
        <h1 className={styles.title}>Review Your Order</h1>
        <p className={styles.subtitle}>Please review your selected package and addon services before proceeding</p>
      </div>

      <div className={styles.layout}>
        {/* Items Panel */}
        <div className={styles.itemsPanel}>
          <div className={styles.itemsPanelHeader}>
            <h3 className={styles.itemsPanelTitle}>
              <i className="fas fa-shopping-cart" />
              Cart Items
              {!isEmpty && <span className={styles.itemCount}>{totalItems}</span>}
            </h3>
          </div>

          {isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🛒</div>
              <p className={styles.emptyText}>Your cart is empty</p>
              <p className={styles.emptySubText}>Add a plan or addon from the packages page to get started.</p>
            </div>
          ) : (
            <>
              {cart.plan && (
                <div className={styles.cartItem}>
                  <div className={styles.itemLeft}>
                    <div className={`${styles.itemIconWrap} ${styles.iconPlan}`}>📦</div>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemTag}>
                        <i className="fas fa-star" style={{ fontSize: "8px" }} />
                        Yearly Plan
                      </div>
                      <p className={styles.itemName}>{cart.plan.name} Package</p>
                      <p className={styles.itemMeta}>{cart.plan.staff} Staff Members included</p>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>
                      {sym}{cart.plan.price.toLocaleString()}
                    </span>
                    <button className={styles.removeBtn} onClick={removePlan} title="Remove plan">
                      <i className="fas fa-times" />
                    </button>
                  </div>
                </div>
              )}

              {cart.addons.map((addon) => (
                <div key={addon.id} className={styles.cartItem}>
                  <div className={styles.itemLeft}>
                    <div className={`${styles.itemIconWrap} ${styles.iconAddon}`}>🔧</div>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemTag}>Add-on Service</div>
                      <p className={styles.itemName}>{addon.name}</p>
                      <p className={styles.itemMeta}>{addon.desc}</p>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.itemPrice}>
                      {sym}{addon.price.toLocaleString()}
                    </span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeAddon(addon.id)}
                      title="Remove addon"
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Summary Panel */}
        <div className={styles.summaryPanel}>
          <div className={styles.summaryHeader}>
            <h3 className={styles.summaryTitle}>
              <i className="fas fa-receipt" />
              Order Summary
            </h3>
          </div>

          <div className={styles.summaryBody}>
            <div className={styles.summaryRow}>
              <span>Package Charges</span>
              <span>{sym}{planPrice.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Addon Services</span>
              <span>{sym}{addonsTotal.toLocaleString()}</span>
            </div>

            <div className={styles.divider} />

            <p className={styles.summaryLabel}>Billing Breakdown</p>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{sym}{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>GST (18%)</span>
              <span>{sym}{gst.toLocaleString()}</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total Payable</span>
              <span className={styles.totalAmount}>{sym}{total.toLocaleString()}</span>
            </div>
            <p className={styles.gstNote}>Inclusive of all taxes</p>

            {error && (
              <p className={styles.errorText}>
                <i className="fas fa-exclamation-circle" />
                {error}
              </p>
            )}

            <button
              className={styles.payBtn}
              onClick={handleOrder}
              disabled={loading || isEmpty}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <i className="fas fa-arrow-right" />
                </>
              )}
            </button>

            <div className={styles.secureNote}>
              <i className="fas fa-lock" />
              Secure & encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}