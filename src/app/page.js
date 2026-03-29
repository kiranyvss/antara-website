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
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: "#FAFAF7", color: "#2E2E2E" }}>
      
      {/* HEADER */}
      <header style={{ padding: "20px", textAlign: "center", background: "#4FA7A3", color: "white" }}>
        <h1 style={{ margin: 0 }}>Antara Counselling & Wellness</h1>
        <p style={{ margin: 0, fontSize: "14px" }}>Serenity Within. Strength Beyond.</p>
      </header>

      {/* HERO */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px" }}>A Safe Space for Your Inner World</h2>
        <p style={{ maxWidth: "600px", margin: "20px auto" }}>
          Compassionate, confidential, and professional mental health support to help you navigate life’s challenges and rediscover balance.
        </p>
        <button style={{ padding: "12px 24px", background: "#4FA7A3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Book a Consultation
        </button>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "40px 20px", maxWidth: "900px", margin: "auto", textAlign: "center" }}>
        <h3>About Antara</h3>
        <p>
          At Antara Counselling & Wellness, we believe healing begins with feeling heard. We provide evidence-based psychological support in a warm and non-judgmental environment, helping individuals, students, and families build resilience and emotional wellbeing.
        </p>
      </section>

      {/* SERVICES */}
      <section style={{ padding: "50px 20px", background: "#F3E9DC" }}>
        <h3 style={{ textAlign: "center" }}>Our Services</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", maxWidth: "900px", margin: "auto" }}>
          {["Individual Counselling", "Student Support", "Anxiety & Stress Management", "Parent Guidance", "Self Growth"].map((service, index) => (
            <div key={index} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
              <h4>{service}</h4>
              <p style={{ fontSize: "14px" }}>Personalized support tailored to your needs.</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h3>Why Choose Antara?</h3>
        <div style={{ maxWidth: "800px", margin: "auto", textAlign: "left" }}>
          <ul>
            <li>Confidential and ethical counselling</li>
            <li>Evidence-based therapeutic approaches</li>
            <li>Warm, non-judgmental environment</li>
            <li>Personalized care and support</li>
          </ul>
        </div>
      </section>

      {/* BOOKING */}
      <section style={{ padding: "60px 20px", background: "#ffffff", textAlign: "center" }}>
        <h3>Book a Consultation</h3>
        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <textarea
            name="concern"
            placeholder="Briefly describe your concern"
            value={formData.concern}
            onChange={handleChange}
            style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ccc" }}
          />

          <button type="submit" style={{ padding: "12px 20px", background: "#4FA7A3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Submit
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "20px", background: "#eee", fontSize: "14px" }}>
        © {new Date().getFullYear()} Antara Counselling & Wellness | Confidential & Professional Care
      </footer>

    </div>
  );
}