"use client";

import MainContent from "@/components/MainContent";
import BookingPanel from "@/components/BookingPanel";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <MainContent />
      </div>
      <div className={styles.rightPanel}>
        <BookingPanel />
      </div>
    </div>
  );
}
