import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Integrations – RND TECHNOSOFT CRM",
  description: "Connect your lead sources to RND TECHNOSOFT CRM. IndiaMart, Facebook, Google Ads, 99acres, Housing and more.",
};

const INTEGRATIONS = [
  { icon: "fab fa-facebook",  title: "Facebook Lead",     href: "/integrations/facebook-lead",      desc: "Pull Facebook Lead Ads directly into your CRM in real time.",                          color: "#eff6ff", accent: "#1877F2", badge: "Most Popular" },
  { icon: "fas fa-globe",     title: "Website Lead",      href: "/integrations/website-lead",       desc: "Embed a lead form on your website and sync enquiries automatically.",                  color: "#f0fdf4", accent: "#15803d", badge: null },
  { icon: "fas fa-store",     title: "IndiaMart",         href: "/integrations/indiamart",          desc: "Automatically import buyer enquiries from your IndiaMart listing.",                   color: "#fff7e6", accent: "#E87722", badge: "Popular" },
  { icon: "fas fa-building",  title: "99acres",           href: "/integrations/99acres",            desc: "Sync property leads from 99acres straight into your pipeline.",                       color: "#fdf4ff", accent: "#7e22ce", badge: null },
  { icon: "fab fa-google",    title: "Google Ads",        href: "/integrations/google-ads",         desc: "Capture Google Ads leads without any manual copy-pasting.",                          color: "#fff1f2", accent: "#ea4335", badge: null },
  { icon: "fas fa-home",      title: "Housing.com",       href: "/integrations/housing",            desc: "Import property enquiries from Housing.com automatically.",                           color: "#eff6ff", accent: "#1d4ed8", badge: null },
  { icon: "fas fa-phone-volume", title: "Just Dial",      href: "/integrations/just-dial",          desc: "Connect Just Dial to get every enquiry routed into your CRM.",                       color: "#fff7e6", accent: "#b45309", badge: null },
  { icon: "fas fa-city",      title: "MagicBricks",       href: "/integrations/magicbricks",        desc: "Automatically sync leads from your MagicBricks property listings.",                   color: "#f0fdf4", accent: "#065f46", badge: null },
  { icon: "fas fa-laptop-code", title: "Software Suggest",href: "/integrations/software-suggest",  desc: "Receive Software Suggest enquiries directly in your lead pipeline.",                  color: "#fdf4ff", accent: "#6b21a8", badge: null },
  { icon: "fas fa-industry",  title: "TradeIndia",        href: "/integrations/tradeindia",         desc: "Import B2B leads from TradeIndia with zero manual effort.",                          color: "#fff7e6", accent: "#c2410c", badge: null },
  { icon: "fab fa-wordpress", title: "WordPress",         href: "/integrations/wordpress-website",  desc: "Connect any WordPress contact or enquiry form to your CRM.",                         color: "#eff6ff", accent: "#21759b", badge: null },
  { icon: "fab fa-google",    title: "Google Form",       href: "/integrations/google-form",        desc: "Route Google Form submissions straight into your lead pipeline.",                     color: "#fff1f2", accent: "#0f9d58", badge: null },
  { icon: "fas fa-bolt",      title: "Systeme.io",        href: "/integrations/systeme-io",         desc: "Sync leads and funnel submissions from Systeme.io automatically.",                   color: "#f0fdf4", accent: "#1e40af", badge: null },
];

export default function IntegrationsPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.tag}>Integrations</div>
        <h1 className={styles.title}>
          All Your Lead Sources, <span>One CRM</span>
        </h1>
        <p className={styles.subtitle}>
          Stop copying leads manually. Connect once and every enquiry flows directly into your pipeline — automatically.
        </p>
        <div className={styles.stats}>
          {[{ v: "13+", l: "Integrations" }, { v: "Zero", l: "Manual entry" }, { v: "Real-time", l: "Lead sync" }].map((s) => (
            <div key={s.l} className={styles.stat}>
              <span className={styles.statVal}>{s.v}</span>
              <span className={styles.statLabel}>{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.body}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {INTEGRATIONS.map((item) => (
              <div key={item.href} className={styles.card}>
                {item.badge && <span className={styles.badge}>{item.badge}</span>}
                <div className={styles.cardTop}>
                  <div className={styles.icon} style={{ background: item.color, color: item.accent }}>
                    <i className={item.icon} />
                  </div>
                  <h2 className={styles.cardTitle}>{item.title}</h2>
                </div>
                <p className={styles.cardDesc}>{item.desc}</p>
                <Link href={item.href} className={styles.cardLink}>
                  Learn how to connect <i className="fas fa-arrow-right" />
                </Link>
              </div>
            ))}
          </div>
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>
              Don't see your lead source? <span>Talk to us.</span>
            </h2>
            <p className={styles.ctaDesc}>
              We regularly add new integrations. If you need a custom connection, our team can set it up.
            </p>
            <Link href="/contact-us" className={styles.btnPrimary}>
              <i className="fas fa-comments" /> Request an Integration
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}