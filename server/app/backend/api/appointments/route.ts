import { NextResponse } from "next/server";
import pool from "../../lib/db";
import { verifyToken } from "../../lib/auth";

export async function GET(req: Request){
  try {
    const user = verifyToken(req);

    if (user.role === "doctor") {
      const doctorResult = await pool.query(
        "SELECT doctor_id FROM doctors WHERE user_id = $1",
        [user.userId]
      );

      const doctorId = doctorResult.rows[0].doctor_id;

      const result = await pool.query(
        `SELECT *
         FROM appointments
         WHERE doctor_id = $1
         ORDER BY appointment_date, appointment_time`,
        [doctorId]
      );

      return NextResponse.json(result.rows);
    }

    if (user.role === "patient") {
      const patientResult = await pool.query(
        "SELECT patient_id FROM patients WHERE user_id = $1",
        [user.userId]
      );

      const patientId = patientResult.rows[0].patient_id;

      const result = await pool.query(
        `SELECT *
         FROM appointments
         WHERE patient_id = $1
         ORDER BY appointment_date, appointment_time`,
        [patientId]
      );

      return NextResponse.json(result.rows);
    }

    return NextResponse.json({ error: "Unauthorized" },{ status: 401 });
  } catch (error) {
    console.error("Appointment GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request){
  try {
    const user = verifyToken(req);

    if (user.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can book appointments" },
        { status: 403 }
      );
    }

    const {
      doctor_id,
      appointment_date,
      appointment_time,
    } = await req.json();

    if (!doctor_id || !appointment_date || !appointment_time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const patientResult = await pool.query(
      "SELECT patient_id FROM patients WHERE user_id = $1",
      [user.userId]
    );

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const patientId = patientResult.rows[0].patient_id;

    const duplicateCheck = await pool.query(
      `SELECT appointment_id
       FROM appointments
       WHERE doctor_id = $1
         AND appointment_date = $2
         AND appointment_time = $3
         AND status = 'booked'`,
      [doctor_id, appointment_date, appointment_time]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Time slot already booked" },
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO appointments
       (doctor_id, patient_id, appointment_date, appointment_time, status)
       VALUES ($1, $2, $3, $4, 'booked')`,
      [doctor_id, patientId, appointment_date, appointment_time]
    );

    return NextResponse.json({
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Appointment POST error:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}