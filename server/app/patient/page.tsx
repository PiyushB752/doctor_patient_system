"use client";

import { useEffect, useState } from "react";

export default function PatientPage() {
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/backend/api/patient/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        gender,
        date_of_birth: dateOfBirth,
      }),
    });

    const data = await res.json();
    console.log("Patient profile saved:", data);
  }

  return (
    <main>
      <h1>Patient Profile</h1>

      <input
        placeholder="Gender"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      />

      <input
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
      />

      <button onClick={handleSubmit}>Save Profile</button>
    </main>
  );
}