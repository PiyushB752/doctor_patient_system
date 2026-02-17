import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = verifyToken(req);

    if (user.role !== "doctor") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const doctorResult = await pool.query(
      "SELECT doctor_id FROM doctors WHERE user_id = $1",
      [user.userId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const doctorId = doctorResult.rows[0].doctor_id;

    const availabilityResult = await pool.query(
      `SELECT
        availability_id,
        day_of_week,
        start_time,
        end_time,
        duration,
        capacity,
        created_at
       FROM doctor_availability
       WHERE doctor_id = $1
       ORDER BY day_of_week, start_time`,
      [doctorId]
    );

    return NextResponse.json(availabilityResult.rows);
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = verifyToken(req);

    if (user.role !== "doctor") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { day_of_week, start_time, end_time, duration, capacity } = await req.json();

    if (
      day_of_week === undefined ||
      !start_time ||
      !end_time ||
      !duration ||
      !capacity
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doctorResult = await pool.query(
      "SELECT doctor_id FROM doctors WHERE user_id = $1",
      [user.userId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const doctorId = doctorResult.rows[0].doctor_id;

    const duplicateCheck = await pool.query(
      `SELECT availability_id
       FROM doctor_availability
       WHERE doctor_id = $1
         AND day_of_week = $2
         AND start_time = $3
         AND end_time = $4
         AND duration = $5
         AND capacity = $6`,
      [doctorId, day_of_week, start_time, end_time, duration, capacity]
    );

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Availability already exists" },
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO doctor_availability
       (doctor_id, day_of_week, start_time, end_time, duration, capacity)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [doctorId, day_of_week, start_time, end_time, duration, capacity]
    );

    return NextResponse.json({
      message: "Doctor availability created successfully",
    });
  } catch (error) {
    console.error("Availability POST error:", error);
    return NextResponse.json(
      { error: "Failed to create availability" },
      { status: 500 }
    );
  }
}