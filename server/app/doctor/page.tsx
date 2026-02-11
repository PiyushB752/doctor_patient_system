"use client";

import { useEffect, useState } from "react";

export default function DoctorPage() {
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [profileDescription, setProfileDescription] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/backend/api/doctor/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        specialization,
        experience: Number(experience),
        consultation_fee: Number(consultationFee),
        profile_description: profileDescription,
      }),
    });

    const data = await res.json();
    console.log("Doctor profile saved:", data);
  }

  return (
    <main>
      <h1>Doctor Profile</h1>

      <input
        placeholder="Specialization"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
      />

      <input
        placeholder="Experience (years)"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      />

      <input
        placeholder="Consultation Fee"
        value={consultationFee}
        onChange={(e) => setConsultationFee(e.target.value)}
      />

      <textarea
        placeholder="Profile Description"
        value={profileDescription}
        onChange={(e) => setProfileDescription(e.target.value)}
      />

      <button onClick={handleSubmit}>Save Profile</button>
    </main>
  );
}
