"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API = "/backend-api";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatTime(value) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, "0")} ${suffix}`;
}

async function request(path, options = {}, token = "") {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-admin-token": token } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [availability, setAvailability] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("availability");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [newSlot, setNewSlot] = useState({ weekday: 0, start_time: "09:00", end_time: "13:00" });
  const [newLeave, setNewLeave] = useState({ counsellor_id: "", leave_date: "", start_time: "", end_time: "", reason: "" });
  const [newHoliday, setNewHoliday] = useState({ holiday_date: "", name: "" });
  const [appointmentDate, setAppointmentDate] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("antara-admin-token");
    if (saved) {
      setToken(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!authenticated || !token) return;
    loadCounsellors();
    loadLeaves();
    loadHolidays();
    loadAppointments();
  }, [authenticated, token]);

  useEffect(() => {
    if (!selectedCounsellor || !token) return;
    loadAvailability(selectedCounsellor);
    setNewLeave((current) => ({ ...current, counsellor_id: selectedCounsellor }));
  }, [selectedCounsellor, token]);

  const selectedName = useMemo(
    () => counsellors.find((c) => c.id === selectedCounsellor)?.name || "",
    [counsellors, selectedCounsellor]
  );

  async function login(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await request("/health");
      if (!data.ok) throw new Error("Backend is unavailable");
      // The admin API authenticates with the configured admin password as x-admin-token.
      await request("/admin/counsellors", {}, password);
      sessionStorage.setItem("antara-admin-token", password);
      setToken(password);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err.message === "Request failed" ? "Incorrect admin password." : err.message);
    }
  }

  function logout() {
    sessionStorage.removeItem("antara-admin-token");
    setAuthenticated(false);
    setToken("");
    setCounsellors([]);
    setAvailability([]);
  }

  async function loadCounsellors() {
    try {
      const data = await request("/admin/counsellors", {}, token);
      setCounsellors(data);
      setSelectedCounsellor((current) => current || data[0]?.id || "");
    } catch (err) { setError(err.message); }
  }

  async function loadAvailability(id = selectedCounsellor) {
    if (!id) return;
    try { setAvailability(await request(`/admin/counsellors/${encodeURIComponent(id)}/availability`, {}, token)); }
    catch (err) { setError(err.message); }
  }

  async function loadLeaves() {
    try { setLeaves(await request("/admin/leaves", {}, token)); } catch (err) { setError(err.message); }
  }

  async function loadHolidays() {
    try { setHolidays(await request("/admin/holidays", {}, token)); } catch (err) { setError(err.message); }
  }

  async function loadAppointments() {
    try {
      const suffix = appointmentDate ? `?appointment_date=${appointmentDate}` : "";
      setAppointments(await request(`/admin/appointments${suffix}`, {}, token));
    } catch (err) { setError(err.message); }
  }

  async function addAvailability(e) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    try {
      await request(`/admin/counsellors/${encodeURIComponent(selectedCounsellor)}/availability`, {
        method: "POST", body: JSON.stringify({ ...newSlot, weekday: Number(newSlot.weekday), active: true }),
      }, token);
      await loadAvailability();
      setNotice(`${DAYS[Number(newSlot.weekday)]} ${formatTime(newSlot.start_time)}–${formatTime(newSlot.end_time)} added.`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function deleteAvailability(id) {
    if (!window.confirm("Remove this working-hour rule?")) return;
    try { await request(`/admin/availability/${id}`, { method: "DELETE" }, token); await loadAvailability(); }
    catch (err) { setError(err.message); }
  }

  async function addLeave(e) {
    e.preventDefault();
    setError(""); setNotice("");
    try {
      await request("/admin/leaves", { method: "POST", body: JSON.stringify({
        counsellor_id: newLeave.counsellor_id || selectedCounsellor,
        leave_date: newLeave.leave_date,
        start_time: newLeave.start_time || null,
        end_time: newLeave.end_time || null,
        reason: newLeave.reason || null,
      }) }, token);
      await loadLeaves();
      setNewLeave((v) => ({ ...v, leave_date: "", start_time: "", end_time: "", reason: "" }));
      setNotice("Leave added. The affected slots will no longer appear to clients.");
    } catch (err) { setError(err.message); }
  }

  async function deleteLeave(id) {
    if (!window.confirm("Remove this leave entry?")) return;
    try { await request(`/admin/leaves/${id}`, { method: "DELETE" }, token); await loadLeaves(); }
    catch (err) { setError(err.message); }
  }

  async function addHoliday(e) {
    e.preventDefault();
    setError(""); setNotice("");
    try {
      await request("/admin/holidays", { method: "POST", body: JSON.stringify(newHoliday) }, token);
      await loadHolidays();
      setNewHoliday({ holiday_date: "", name: "" });
      setNotice("Holiday added. No counsellor slots will be offered on that date.");
    } catch (err) { setError(err.message); }
  }

  async function deleteHoliday(id) {
    if (!window.confirm("Remove this holiday?")) return;
    try { await request(`/admin/holidays/${id}`, { method: "DELETE" }, token); await loadHolidays(); }
    catch (err) { setError(err.message); }
  }

  async function cancelAppointment(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try { await request(`/admin/appointments/${id}/cancel`, { method: "PATCH" }, token); await loadAppointments(); }
    catch (err) { setError(err.message); }
  }

  if (!authenticated) {
    return <main className={styles.page}><div className={styles.loginCard}>
      <div className={styles.brand}>ANTARA</div>
      <h1>Admin Schedule</h1>
      <p>Manage counsellor working hours, leave and holidays.</p>
      <form onSubmit={login} className={styles.form}>
        <label>Admin password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus /></label>
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.primary} type="submit">Sign in</button>
      </form>
      <a className={styles.backLink} href="/">← Back to booking page</a>
    </div></main>;
  }

  return <main className={styles.page}>
    <header className={styles.header}>
      <div><div className={styles.brand}>ANTARA</div><h1>Counsellor Availability</h1><p>Control when each counsellor can receive appointments.</p></div>
      <div className={styles.headerActions}><a href="/">View booking page</a><button onClick={logout} className={styles.secondary}>Sign out</button></div>
    </header>

    {error && <div className={styles.errorBanner}>{error}<button onClick={() => setError("")}>×</button></div>}
    {notice && <div className={styles.notice}>{notice}<button onClick={() => setNotice("")}>×</button></div>}

    <section className={styles.toolbar}>
      <label>Counsellor<select value={selectedCounsellor} onChange={(e) => setSelectedCounsellor(e.target.value)}>{counsellors.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}</select></label>
      {selectedName && <div className={styles.summary}><strong>{selectedName}</strong><span>Timezone: Asia/Kolkata</span></div>}
    </section>

    <nav className={styles.tabs}>
      {[['availability','Weekly hours'],['leave','Leave'],['holidays','Holidays'],['appointments','Appointments']].map(([id,label]) => <button key={id} onClick={() => setActiveTab(id)} className={activeTab === id ? styles.activeTab : ""}>{label}</button>)}
    </nav>

    {activeTab === "availability" && <section className={styles.panel}>
      <div className={styles.panelHeading}><div><h2>Weekly working hours</h2><p>Add one or more working windows per day. Example: 9 AM–1 PM and 2 PM–6 PM.</p></div><button onClick={() => loadAvailability()} className={styles.secondary}>Refresh</button></div>
      <form onSubmit={addAvailability} className={styles.inlineForm}>
        <label>Day<select value={newSlot.weekday} onChange={(e) => setNewSlot({ ...newSlot, weekday: e.target.value })}>{DAYS.map((day, i) => <option key={day} value={i}>{day}</option>)}</select></label>
        <label>From<input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })} required /></label>
        <label>To<input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })} required /></label>
        <button disabled={loading || !selectedCounsellor} className={styles.primary}>Add hours</button>
      </form>
      <div className={styles.weekGrid}>{DAYS.map((day, index) => <div className={styles.dayCard} key={day}><div className={styles.dayTitle}>{day}</div>{availability.filter((x) => x.weekday === index).length ? availability.filter((x) => x.weekday === index).map((slot) => <div className={styles.slotRow} key={slot.id}><span>{formatTime(slot.start_time)} – {formatTime(slot.end_time)}</span><button onClick={() => deleteAvailability(slot.id)} aria-label={`Delete ${day} hours`}>Remove</button></div>) : <span className={styles.closed}>Closed</span>}</div>)}</div>
    </section>}

    {activeTab === "leave" && <section className={styles.panel}>
      <div className={styles.panelHeading}><div><h2>Counsellor leave</h2><p>Full-day leave blocks all slots. Add times for partial-day leave.</p></div></div>
      <form onSubmit={addLeave} className={styles.formGrid}>
        <label>Counsellor<select value={newLeave.counsellor_id || selectedCounsellor} onChange={(e) => setNewLeave({ ...newLeave, counsellor_id: e.target.value })}>{counsellors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label>Date<input type="date" value={newLeave.leave_date} onChange={(e) => setNewLeave({ ...newLeave, leave_date: e.target.value })} required /></label>
        <label>From (optional)<input type="time" value={newLeave.start_time} onChange={(e) => setNewLeave({ ...newLeave, start_time: e.target.value })} /></label>
        <label>To (optional)<input type="time" value={newLeave.end_time} onChange={(e) => setNewLeave({ ...newLeave, end_time: e.target.value })} /></label>
        <label className={styles.wide}>Reason<input value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Personal leave, training, etc." /></label>
        <button className={styles.primary}>Add leave</button>
      </form>
      <div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Counsellor</th><th>Time</th><th>Reason</th><th></th></tr></thead><tbody>{leaves.length ? leaves.map((x) => <tr key={x.id}><td>{x.date}</td><td>{counsellors.find((c) => c.id === x.counsellor_id)?.name || x.counsellor_id}</td><td>{x.start ? `${formatTime(x.start)} – ${formatTime(x.end)}` : "Full day"}</td><td>{x.reason || "—"}</td><td><button onClick={() => deleteLeave(x.id)} className={styles.danger}>Remove</button></td></tr>) : <tr><td colSpan="5" className={styles.empty}>No leave entries.</td></tr>}</tbody></table></div>
    </section>}

    {activeTab === "holidays" && <section className={styles.panel}>
      <div className={styles.panelHeading}><div><h2>Clinic holidays</h2><p>Holiday dates block bookings for every counsellor.</p></div></div>
      <form onSubmit={addHoliday} className={styles.inlineForm}><label>Date<input type="date" value={newHoliday.holiday_date} onChange={(e) => setNewHoliday({ ...newHoliday, holiday_date: e.target.value })} required /></label><label className={styles.grow}>Holiday name<input value={newHoliday.name} onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })} placeholder="Diwali" required /></label><button className={styles.primary}>Add holiday</button></form>
      <div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Holiday</th><th></th></tr></thead><tbody>{holidays.length ? holidays.map((x) => <tr key={x.id}><td>{x.date}</td><td>{x.name}</td><td><button onClick={() => deleteHoliday(x.id)} className={styles.danger}>Remove</button></td></tr>) : <tr><td colSpan="3" className={styles.empty}>No holidays configured.</td></tr>}</tbody></table></div>
    </section>}

    {activeTab === "appointments" && <section className={styles.panel}>
      <div className={styles.panelHeading}><div><h2>Appointments</h2><p>Booked appointments automatically block those time slots.</p></div></div>
      <div className={styles.inlineForm}><label>Date (optional)<input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} /></label><button onClick={loadAppointments} className={styles.secondary}>Load appointments</button></div>
      <div className={styles.tableWrap}><table><thead><tr><th>Date</th><th>Time</th><th>Counsellor</th><th>Client</th><th>Service</th><th>Status</th><th></th></tr></thead><tbody>{appointments.length ? appointments.map((x) => <tr key={x.id}><td>{x.date}</td><td>{formatTime(x.start)} – {formatTime(x.end)}</td><td>{x.counsellor}</td><td>{x.client}<br/><small>{x.phone || x.email || ""}</small></td><td>{x.type}</td><td><span className={x.status === "BOOKED" || x.status === "CONFIRMED" ? styles.statusBooked : styles.statusCancelled}>{x.status}</span></td><td>{x.status !== "CANCELLED" && <button onClick={() => cancelAppointment(x.id)} className={styles.danger}>Cancel</button>}</td></tr>) : <tr><td colSpan="7" className={styles.empty}>No appointments found.</td></tr>}</tbody></table></div>
    </section>}

    <footer className={styles.footer}>Booking window: 60 days · Slot interval: 30 minutes · Client-facing availability is calculated from these rules, leave, holidays and existing bookings.</footer>
  </main>;
}
