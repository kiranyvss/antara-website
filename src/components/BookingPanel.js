"use client";

import { useEffect, useMemo, useState } from "react";
import { staffData, getStaffByService } from "@/data/staff";
import styles from "./BookingPanel.module.css";

const API = process.env.NEXT_PUBLIC_BACKEND_PREFIX || "/backend-api";
const serviceFallback = [
  "Individual Counselling",
  "Student Support",
  "Anxiety & Stress Management",
  "Parent Guidance",
  "Self Growth",
  "Added for testing purposes"
];

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function todayString() { return localDateString(); }
function addDaysString(days) { const d = new Date(); d.setDate(d.getDate() + days); return localDateString(d); }

export default function BookingPanel() {
  const [clientData, setClientData] = useState({ name: "", age: "", gender: "", phone: "", email: "" });
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [types, setTypes] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetch(`${API}/appointment-types`).then(r => r.json()).then(setTypes).catch(() => setTypes([])); }, []);

  const services = useMemo(() => types.length ? types.map(x => x.name) : serviceFallback, [types]);
  const availableStaff = selectedService ? getStaffByService(selectedService) : staffData;
  const selectedType = types.find(x => x.name === selectedService);
  const minDate = todayString();
  const maxDate = addDaysString(60);

  const handleClientChange = e => setClientData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleServiceChange = e => { setSelectedService(e.target.value); setSelectedStaff(""); setSelectedDate(""); setSelectedSlot(""); setSlots([]); setError(""); setMessage(""); };

  useEffect(() => {
    if (!selectedStaff || !selectedDate || !selectedType) return;
    setLoadingSlots(true); setSelectedSlot(""); setError("");
    fetch(`${API}/availability?counsellor_id=${encodeURIComponent(selectedStaff)}&appointment_date=${selectedDate}&appointment_type_id=${selectedType.id}`)
      .then(async r => { if (!r.ok) throw new Error("Could not load availability"); return r.json(); })
      .then(data => setSlots(data.slots || []))
      .catch(e => { setSlots([]); setError(e.message); })
      .finally(() => setLoadingSlots(false));
  }, [selectedStaff, selectedDate, selectedType]);

  const reset = () => { setClientData({ name: "", age: "", gender: "", phone: "", email: "" }); setSelectedService(""); setSelectedStaff(""); setSelectedDate(""); setSelectedSlot(""); setSlots([]); setMessage(""); setError(""); };

  const handleSubmit = async e => {
    e.preventDefault(); setError(""); setMessage("");
    if (!selectedType || !selectedStaff || !selectedDate || !selectedSlot) { setError("Please select service, counsellor, date and time."); return; }
    try {
      const response = await fetch(`${API}/appointments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        counsellor_id: selectedStaff, appointment_type_id: selectedType.id, appointment_date: selectedDate,
        start_time: `${selectedSlot}:00`, client_name: clientData.name, client_age: Number(clientData.age), client_gender: clientData.gender,
        client_phone: clientData.phone, client_email: clientData.email || null
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to book appointment");
      setMessage(`Appointment booked successfully for ${selectedDate} at ${selectedSlot}. Booking #${data.id}`);
      setSelectedSlot("");
      setSlots(slots.filter(s => s.start_time !== selectedSlot));
    } catch (e) { setError(e.message); }
  };

  return <div className={styles.bookingPanel}>
    <h2 className={styles.heading}>Book a Consultation</h2>
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Details</h3>
        <input type="text" name="name" placeholder="Name *" value={clientData.name} onChange={handleClientChange} required className={styles.input}/>
        <input type="number" name="age" placeholder="Age *" min="1" max="120" value={clientData.age} onChange={handleClientChange} required className={styles.input}/>
        <select name="gender" value={clientData.gender} onChange={handleClientChange} required className={styles.input}><option value="">Select Gender *</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select>
        <input type="tel" name="phone" placeholder="Phone # *" value={clientData.phone} onChange={handleClientChange} required className={styles.input}/>
        <input type="email" name="email" placeholder="Email (optional)" value={clientData.email} onChange={handleClientChange} className={styles.input}/>
      </div>
      <div className={styles.section}><h3 className={styles.sectionTitle}>Select Service</h3><div className={styles.radioGroup}>{services.map(service => <label key={service} className={styles.radioLabel}><input type="radio" name="service" value={service} checked={selectedService === service} onChange={handleServiceChange} className={styles.radio}/><span>{service}</span></label>)}</div></div>
      {selectedService && <div className={styles.section}><h3 className={styles.sectionTitle}>Select Counsellor</h3><div className={styles.staffGrid}>{availableStaff.map(staff => <div key={staff.id} className={`${styles.staffCard} ${selectedStaff === staff.id ? styles.selected : ""}`} onClick={() => { setSelectedStaff(staff.id); setSelectedDate(""); setSelectedSlot(""); }}>
        <div className={styles.staffPhotoContainer}><img src={staff.photo} alt={staff.name} className={styles.staffPhoto}/></div><div className={styles.staffInfo}><h4 className={styles.staffName}>{staff.name}</h4><p className={styles.staffQualifications}>{staff.qualifications.split("\n")[0]}</p><p className={styles.staffSpecialization}><strong>Specialization:</strong><br/>{staff.specializations.split("\n").join(", ")}</p><p className={styles.staffFee}>₹{staff.feePerHour}/hour</p></div><input type="radio" name="staff" checked={selectedStaff === staff.id} onChange={() => setSelectedStaff(staff.id)} className={styles.staffRadio}/>
      </div>)}</div></div>}
      {selectedStaff && <div className={styles.section}><h3 className={styles.sectionTitle}>Select Date & Time</h3><input type="date" value={selectedDate} min={minDate} max={maxDate} onChange={e => setSelectedDate(e.target.value)} className={styles.input} required/>{selectedDate && <div className={styles.slotArea}>{loadingSlots ? <p className={styles.info}>Loading available times...</p> : slots.length ? <div className={styles.slotGrid}>{slots.map(slot => <button type="button" key={slot.start_time} className={`${styles.slotButton} ${selectedSlot === slot.start_time ? styles.slotSelected : ""}`} onClick={() => setSelectedSlot(slot.start_time)}>{slot.start_time}<span>{slot.end_time}</span></button>)}</div> : <p className={styles.info}>No available slots for this date. Please choose another date.</p>}</div>}</div>}
      {error && <div className={styles.error}>{error}</div>}{message && <div className={styles.success}>{message}</div>}
      <div className={styles.buttonGroup}><button type="submit" className={`${styles.button} ${styles.primaryBtn}`}>Book Appointment</button><button type="button" onClick={reset} className={`${styles.button} ${styles.secondaryBtn}`}>Clear Form</button><button type="button" onClick={() => window.scrollTo({top:0, behavior:"smooth"})} className={`${styles.button} ${styles.exitBtn}`}>Exit</button></div>
    </form>
  </div>;
}
