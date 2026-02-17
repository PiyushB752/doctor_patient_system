"use client";

import { useEffect, useState } from "react";

export default function DoctorAvailabilityPage() {
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [duration, setDuration] = useState("30");
  const [capacity, setCapacity] = useState("1");
  const [availability, setAvailability] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/backend/api/doctor/availability", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("Availability list:", data);
    setAvailability(data);
  }

  async function createAvailability() {
    setError("");
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/backend/api/doctor/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        duration: Number(duration),
        capacity: Number(capacity),
      }),
    });

    const data = await res.json();
    console.log("Create response:", data);

    if (!res.ok) {
      setError(data.error || "Failed to create availability");
      return;
    }

    fetchAvailability();
  }

  return (
    <main>
      <h1>Doctor Availability (Test Page)</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label>Day of Week (0–6)</label>
        <input
          type="number"
          min="0"
          max="6"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
        />
      </div>

      <div>
        <label>Start Time</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div>
        <label>End Time</label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <div>
        <label>Duration (minutes)</label>
        <input
          type="number"
          min="5"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>

      <div>
        <label>Capacity</label>
        <input
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>

      <button onClick={createAvailability}>Add Availability</button>

      <hr />
      <h2>Saved Availability</h2>

      <ul>
        {availability.map((slot) => (
          <li key={slot.availability_id}>
            Day {slot.day_of_week} |{" "}
            {slot.start_time} - {slot.end_time} |{" "}
            {slot.duration} min | Capacity {slot.capacity}
          </li>
        ))}
      </ul>
    </main>
  );
}