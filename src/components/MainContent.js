"use client";

import { useState } from "react";
import { staffData } from "@/data/staff";
import styles from "./MainContent.module.css";

export default function MainContent() {
  const [expandedStaff, setExpandedStaff] = useState(null);

  const services = [
    {
      title: "Individual Counselling",
      description: "Personalized one-on-one therapy sessions tailored to your unique needs and challenges."
    },
    {
      title: "Student Support",
      description: "Specialized counselling for students dealing with academic stress and personal development."
    },
    {
      title: "Anxiety & Stress Management",
      description: "Evidence-based techniques to manage anxiety, stress, and overwhelming emotions."
    },
    {
      title: "Parent Guidance",
      description: "Support for parents navigating challenges in parenting and family dynamics."
    },
    {
      title: "Self Growth",
      description: "Personal development sessions focused on self-discovery and achieving your potential."
    }
  ];

  const whyChoosePoints = [
    "Confidential and ethical counselling",
    "Evidence-based therapeutic approaches",
    "Warm, non-judgmental environment",
    "Personalized care and support",
    "Professional and experienced counsellors",
    "Flexible scheduling and accessibility"
  ];

  return (
    <div className={styles.mainContent}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Antara Mind Studio</h1>
        <p className={styles.headerSubtitle}>Serenity Within. Strength Beyond.</p>
      </header>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <h2>A Safe Space for Your Inner World</h2>
        <p>
          Compassionate, confidential, and professional mental health support to help you navigate life's challenges and rediscover balance.
        </p>
      </section>

      {/* ABOUT SECTION */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>About Antara</h3>
        <div className={styles.sectionContent}>
          <p>
            At Antara Mind Studio, we believe healing begins with feeling heard. We provide evidence-based psychological support in a warm and non-judgmental environment, helping individuals navigate life's challenges with resilience and clarity.
          </p>
          <p>
            Our mission is to create accessible, compassionate mental health services that empower you to understand yourself better and build a more meaningful life. Whether you're struggling with anxiety, depression, personal growth, or life transitions, we're here to support your journey.
          </p>
          <p>
            With a team of qualified and experienced counsellors, we are committed to providing personalized care that respects your unique circumstances and values. Your confidentiality and well-being are our top priorities.
          </p>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Our Services</h3>
        <div className={styles.servicesGrid}>
          {services.map((service, index) => (
            <div key={index} className={styles.serviceCard}>
              <h4>{service.title}</h4>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE ANTARA SECTION */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Why Choose Antara?</h3>
        <div className={styles.whyChooseList}>
          <ul>
            {whyChoosePoints.map((point, index) => (
              <li key={index}>
                <span className={styles.checkmark}>✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MEET OUR TEAM SECTION */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Meet Our Team</h3>
        <p className={styles.teamIntro}>
          Our experienced and qualified counsellors are dedicated to providing you with the best care.
        </p>
        <div className={styles.teamGrid}>
          {staffData.map((staff) => (
            <div 
              key={staff.id} 
              className={styles.teamMember}
              onClick={() => setExpandedStaff(expandedStaff === staff.id ? null : staff.id)}
            >
              <div className={styles.memberPhotoContainer}>
                <img
                  src={staff.photo}
                  alt={staff.name}
                  className={styles.memberPhoto}
                  onError={(e) => {
                    e.target.src = "/staff-photos/placeholder.jpg";
                  }}
                />
              </div>
              
              <div className={styles.memberInfo}>
                <h4 className={styles.memberName}>{staff.name}</h4>
                <p className={styles.memberSpecialization}>
                  {staff.specializations}
                </p>
                
                {expandedStaff === staff.id && (
                  <div className={styles.memberDetails}>
                    <p className={styles.memberQualifications}>
                      <strong>Qualifications:</strong><br />
                      {staff.qualifications}
                    </p>
                    <p className={styles.memberDetailedInfo}>
                      {staff.detailedInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
