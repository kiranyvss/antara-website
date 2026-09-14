"use client";

import { useState } from "react";
import { staffData, getStaffByService } from "@/data/staff";
import styles from "./BookingPanel.module.css";

export default function BookingPanel() {
  const [clientData, setClientData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
  });

  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const services = [
    "Individual Counselling",
    "Student Support",
    "Anxiety & Stress Management",
    "Parent Guidance",
    "Self Growth"
  ];

  // Get staff for selected service (all staff by default)
  const availableStaff = selectedService ? getStaffByService(selectedService) : staffData;

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
    setSelectedStaff(""); // Reset staff selection when service changes
  };

  const handleStaffChange = (e) => {
    setSelectedStaff(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Appointment booked successfully!");
    // Reset form
    setClientData({ name: "", age: "", gender: "", phone: "", email: "" });
    setSelectedService("");
    setSelectedStaff("");
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleClear = () => {
    setClientData({ name: "", age: "", gender: "", phone: "", email: "" });
    setSelectedService("");
    setSelectedStaff("");
    setSelectedDate("");
    setSelectedSlot("");
  };

  const handleExit = () => {
    // Scroll to top or close panel
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.bookingPanel}>
      <h2 className={styles.heading}>Book a Consultation</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* CLIENT DETAILS SECTION */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Your Details</h3>
          
          <input
            type="text"
            name="name"
            placeholder="Name *"
            value={clientData.name}
            onChange={handleClientChange}
            required
            className={styles.input}
          />
          
          <input
            type="number"
            name="age"
            placeholder="Age *"
            value={clientData.age}
            onChange={handleClientChange}
            required
            className={styles.input}
          />
          
          <select
            name="gender"
            value={clientData.gender}
            onChange={handleClientChange}
            required
            className={styles.input}
          >
            <option value="">Select Gender *</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          
          <input
            type="tel"
            name="phone"
            placeholder="Phone # *"
            value={clientData.phone}
            onChange={handleClientChange}
            required
            className={styles.input}
          />
          
          <input
            type="email"
            name="email"
            placeholder="Email (optional)"
            value={clientData.email}
            onChange={handleClientChange}
            className={styles.input}
          />
        </div>

        {/* SERVICE SELECTION SECTION */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Select Service</h3>
          
          <div className={styles.radioGroup}>
            {services.map((service) => (
              <label key={service} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="service"
                  value={service}
                  checked={selectedService === service}
                  onChange={handleServiceChange}
                  className={styles.radio}
                />
                <span>{service}</span>
              </label>
            ))}
          </div>
        </div>

        {/* STAFF SELECTION SECTION */}
        {selectedService && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Select Counsellor</h3>
            
            <div className={styles.staffGrid}>
              {availableStaff.map((staff) => (
                <div
                  key={staff.id}
                  className={`${styles.staffCard} ${selectedStaff === staff.id ? styles.selected : ""}`}
                  onClick={() => setSelectedStaff(staff.id)}
                >
                  <div className={styles.staffPhotoContainer}>
                    <img
                      src={staff.photo}
                      alt={staff.name}
                      className={styles.staffPhoto}
                      onError={(e) => {
                        e.target.src = "/staff-photos/placeholder.jpg";
                      }}
                    />
                  </div>
                  
                  <div className={styles.staffInfo}>
                    <h4 className={styles.staffName}>{staff.name}</h4>
                    <p className={styles.staffQualifications}>
                      {staff.qualifications.split('\n')[0]}
                    </p>
                    <p className={styles.staffSpecialization}>
                      <strong>Specialization:</strong><br />
                      {staff.specializations.split('\n').map((spec, idx) => (
                        <span key={idx}>
                          {spec}
                          {idx < staff.specializations.split('\n').length - 1 && ', '}
                        </span>
                      ))}
                    </p>
                    <p className={styles.staffFee}>₹{staff.feePerHour}/hour</p>
                  </div>
                  
                  <input
                    type="radio"
                    name="staff"
                    value={staff.id}
                    checked={selectedStaff === staff.id}
                    onChange={handleStaffChange}
                    className={styles.staffRadio}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVAILABILITY SECTION - TO BE IMPLEMENTED */}
        {selectedStaff && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Select Date & Time</h3>
            <p style={{ color: "#999", fontSize: "14px" }}>
              Availability matrix to be implemented - showing next 2 days with 1-hour slots (2x3 format)
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.input}
              disabled
            />
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className={styles.buttonGroup}>
          <button type="submit" className={`${styles.button} ${styles.primaryBtn}`}>
            Book Appointment
          </button>
          <button type="button" onClick={handleClear} className={`${styles.button} ${styles.secondaryBtn}`}>
            Clear Form
          </button>
          <button type="button" onClick={handleExit} className={`${styles.button} ${styles.exitBtn}`}>
            Exit
          </button>
        </div>
      </form>
    </div>
  );
}
