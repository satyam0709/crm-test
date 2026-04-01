"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./faq.module.css";

const FAQS = [
  {
    q: "What is CRM software?",
    a: "CRM (Customer Relationship Management) software helps businesses manage interactions with current and potential customers, streamline processes, and improve profitability.",
  },
  {
    q: "Who can use this CRM software?",
    a: "Our CRM is designed for sales teams, marketing professionals, support agents, and business owners across various industries looking to optimize their operations.",
  },
  {
    q: "What features does the CRM software include?",
    a: "Key features include lead management, marketing automation, seamless integrations, performance analytics, task management, and communication tools.",
  },
  {
    q: "Does the software support multi-user access?",
    a: "Yes, our CRM supports multi-user access with customizable role-based permissions to ensure data security and team collaboration.",
  },
  {
    q: "Can I customize the CRM to fit my business needs?",
    a: (
      <>
        <p className={styles.answerText}>Yes! You can customize:</p>
        <p className={styles.answerSubhead}>
          <strong>For Organization-Based Systems</strong>
        </p>
        <ul className={styles.faqList}>
          <li>
            <strong>Custom Hierarchies:</strong> Define roles and permissions
            based on your organizational structure. Assign access levels to
            departments, teams, or individual users.
          </li>
          <li>
            <strong>Departmental Modules:</strong> Create modules for Sales, HR,
            Finance, and Marketing tailored to each department's workflows.
            Automate cross-departmental processes like lead handovers or
            approvals.
          </li>
          <li>
            <strong>Performance Dashboards:</strong> Generate team or
            department-specific dashboards to monitor productivity and KPIs.
            Customize reports for organizational performance tracking.
          </li>
        </ul>
      </>
    ),
  },
  {
    q: "How secure is the CRM software?",
    a: "We prioritize your data security with end-to-end encryption, regular automated backups, and strict compliance with global data protection regulations.",
  },
  {
    q: "Can the CRM integrate with other software?",
    a: "Yes, 365 CRM can integrate with various software platforms like TradeIndia, 99acres, Justdial, Facebook, Instagram, MagicBricks, Google Calendar, SoftwareSuggest and WordPress, allowing seamless data synchronization and enhanced functionality to streamline your business processes. Additionally, the CRM supports custom forms, enabling you to collect and manage data specific to your business needs.",
  },
  {
    q: "What are the pricing plans?",
    a: "We offer flexible pricing plans tailored to businesses of all sizes. Please visit our pricing page or contact sales for a detailed breakdown.",
  },
  {
    q: "Is there a free trial available?",
    a: "Yes, we offer a 14-day free trial so you can explore all the premium features before making a commitment.",
  },
  {
    q: "What kind of support do you offer?",
    a: "We offer 24/7 email and chat support, along with a comprehensive knowledge base and dedicated account managers for enterprise plans.",
  },
  {
    q: "Does the CRM have a mobile app?",
    a: "Yes, our mobile app is available on both iOS and Android, allowing you to manage your business on the go.",
  },
  {
    q: "Can I work offline on the mobile app?",
    a: "Yes, the mobile app includes offline capabilities. Your changes will automatically sync once your connection is restored.",
  },
  {
    q: "How do I get started?",
    a: "Simply sign up for our free trial, and our onboarding wizard will guide you through importing your contacts and setting up your first campaign.",
  },
  {
    q: "Is training provided for new users?",
    a: "Absolutely. We provide extensive video tutorials, live webinars, and personalized onboarding sessions to ensure your team is set up for success.",
  },
];

export default function FAQSection({ preview = false }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // If preview is true (Homepage), show as per u want items. Otherwise (FAQ page), show all.
  const displayFAQs = preview ? FAQS.slice(0, 6) : FAQS;

  // Split data into two distinct columns to prevent layout shifts
  const leftColumn = displayFAQs
    .map((faq, i) => ({ ...faq, originalIndex: i }))
    .filter((_, i) => i % 2 === 0);
  const rightColumn = displayFAQs
    .map((faq, i) => ({ ...faq, originalIndex: i }))
    .filter((_, i) => i % 2 !== 0);

  // Reusable function to render a single column
  const renderColumn = (columnData) => (
    <div className={styles.faqColumn}>
      {columnData.map((faq) => {
        const isOpen = openIndex === faq.originalIndex;
        return (
          <div
            key={faq.originalIndex}
            className={`${styles.faqCard} ${isOpen ? styles.activeCard : ""}`}
          >
            <div
              className={styles.faqQuestion}
              onClick={() => toggleFAQ(faq.originalIndex)}
            >
              <i
                className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"} ${styles.icon}`}
              />
              <h3>{faq.q}</h3>
            </div>

            {isOpen && <div className={styles.faqAnswer}>{faq.a}</div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>

        {/* Replaced Grid with Flex Wrapper */}
        <div className={styles.faqWrapper}>
          {renderColumn(leftColumn)}
          {renderColumn(rightColumn)}
        </div>

        {/* View More button only renders in Preview Mode */}
        {preview && (
          <div className={styles.btnWrapper}>
            <Link href="/faqs" className={styles.viewMoreBtn}>
              View More
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
