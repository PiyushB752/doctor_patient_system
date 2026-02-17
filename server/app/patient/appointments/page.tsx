"use client";

import { useEffect, useState } from "react";

export default function PatientAppointmentsPage() {
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/backend/api/appointments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setAppointments(data);
  }

  async function bookAppointment() {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/backend/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        doctor_id: Number(doctorId),
        appointment_date: date,
        appointment_time: time,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    fetchAppointments();
  }

  return (
    <main>
      <h1>Book Appointment (Test Page)</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Doctor ID"
        value={doctorId}
        onChange={(e) => setDoctorId(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <button onClick={bookAppointment}>Book</button>

      <hr />

      <h2>Your Appointments</h2>

      <ul>
        {appointments.map((a) => (
          <li key={a.appointment_id}>
            Doctor {a.doctor_id} | {a.appointment_date} {a.appointment_time} |{" "}
            {a.status}
          </li>
        ))}
      </ul>
    </main>
  );
}