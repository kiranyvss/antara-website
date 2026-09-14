"use client";

import styles from "./page.module.css";

export default function AdminPage() {
  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || "";
  return <main className={styles.page}>
    <section className={styles.card}>
      <div className={styles.brand}>ANTARA</div>
      <h1>Appointment Management</h1>
      <p className={styles.lead}>Counsellor availability is managed securely in the Antara Google Sheet. You do not need a separate admin password or backend server.</p>
      <div className={styles.steps}>
        <div><strong>1. Open the Google Sheet</strong><span>Use the button below. Your Google account permissions protect the sheet.</span></div>
        <div><strong>2. Open the Availability tab</strong><span>Add or change the counsellor's working hours. Monday is 0, Tuesday is 1, through Sunday 6.</span></div>
        <div><strong>3. Save</strong><span>The client booking page reads the sheet automatically and removes booked, leave and holiday times.</span></div>
      </div>
      {sheetUrl ? <a className={styles.primary} href={sheetUrl} target="_blank" rel="noreferrer">Open Antara Google Sheet ↗</a> : <div className={styles.notice}>Add <code>NEXT_PUBLIC_GOOGLE_SHEET_URL</code> in Vercel to enable this button.</div>}
      <a className={styles.backLink} href="/">← Back to booking page</a>
    </section>
  </main>;
}
