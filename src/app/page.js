"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    concern: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your consultation request has been submitted!");
    setFormData({ name: "", email: "", date: "", concern: "" });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#FAFAF7" }}>
      
      {/* HEADER */}
      <header style={{ padding: "20px", textAlign: "center", background: "#4FA7A3", color: "white" }}>
        <h1>Antara Counselling & Wellness</h1>
        <p>Serenity Within. Strength Beyond.</p>
      </header>

      {/* HERO */}
      <section style={{ padding: "40px", textAlign: "center" }}>
        <h2>Compassionate Mental Health Support</h2>
        <p>
          A safe and supportive space where you can explore your thoughts,
          emotions, and challenges with professional guidance.
        </p>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
        <h3>About Us</h3>
        <p>
          At Antara Counselling & Wellness, we provide confidential and
          evidence-based psychological support for individuals, students, and families.
          Our goal is to help you build resilience, emotional balance, and personal growth.
        </p>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "30px", background: "#F3E9DC" }}>
        <h3 style={{ textAlign: "center" }}>Our Services</h3>
        <ul style={{ maxWidth: "600px", margin: "auto" }}>
          <li>Individual Counselling</li>
          <li>Student Emotional Support</li>
          <li>Anxiety & Stress Management</li>
          <li>Parent Guidance</li>
          <li>Personal Growth & Self-esteem</li>
        </ul>
      </section>

      {/* BOOKING */}
      <section style={{ padding: "40px", textAlign: "center" }}>
        <h3>Book a Consultation</h3>
        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", margin: "10px 0",boxSizing: "border-box", fontSize: "16px" }}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", margin: "10px 0",boxSizing: "border-box", fontSize: "16px" }}
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />

          <textarea
            name="concern"
            placeholder="Your concern"
            value={formData.concern}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", margin: "10px 0",boxSizing: "border-box", fontSize: "16px" }}
          />

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#4FA7A3",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "20px", background: "#eee" }}>
        © {new Date().getFullYear()} Antara Counselling & Wellness
      </footer>

    </div>
  );
}