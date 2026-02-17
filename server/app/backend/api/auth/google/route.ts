import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyGoogleToken } from "../../../lib/google";
import { signToken } from "../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const { token, role } = await req.json();

    if (!token || !role) {
      return NextResponse.json(
        { error: "Google token and role are required" },
        { status: 400 }
      );
    }

    if (role !== "patient" && role !== "doctor") {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const payload = await verifyGoogleToken(token);

    if (!payload?.email) {
      return NextResponse.json(
        { error: "Invalid Google token payload" },
        { status: 401 }
      );
    }

    const email = payload.email;
    const name = payload.name ?? "Unknown";

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (existingUser.rows.length === 0) {
      const result = await pool.query(
        `INSERT INTO users (name, email, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, email, role]
      );
      user = result.rows[0];
    } else {
      user = existingUser.rows[0];
    }

    if (user.role === "doctor") {
      const doctorCheck = await pool.query(
        "SELECT doctor_id FROM doctors WHERE user_id = $1",
        [user.user_id]
      );

      if (doctorCheck.rows.length === 0) {
        await pool.query(
          "INSERT INTO doctors (user_id) VALUES ($1)",
          [user.user_id]
        );
      }
    }

    if (user.role === "patient") {
      const patientCheck = await pool.query(
        "SELECT patient_id FROM patients WHERE user_id = $1",
        [user.user_id]
      );

      if (patientCheck.rows.length === 0) {
        await pool.query(
          "INSERT INTO patients (user_id) VALUES ($1)",
          [user.user_id]
        );
      }
    }

    const jwtToken = signToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token: jwtToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}