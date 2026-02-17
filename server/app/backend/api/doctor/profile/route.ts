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

    const result = await pool.query(
      `SELECT 
          d.doctor_id,
          u.name,
          u.email,
          d.specialization,
          d.experience,
          d.consultation_fee,
          d.profile_description
       FROM doctors d
       JOIN users u ON u.user_id = d.user_id
       WHERE d.user_id = $1`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Doctor GET error:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = verifyToken(req);

    if (user.role !== "doctor") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const {
      specialization,
      experience,
      consultation_fee,
      profile_description,
    } = await req.json();

    await pool.query(
      `UPDATE doctors
       SET specialization = $1,
           experience = $2,
           consultation_fee = $3,
           profile_description = $4
       WHERE user_id = $5`,
      [
        specialization,
        experience,
        consultation_fee,
        profile_description,
        user.userId,
      ]
    );

    return NextResponse.json({
      message: "Doctor profile updated successfully",
    });
  } catch (error) {
    console.error("Doctor PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update doctor profile" },
      { status: 500 }
    );
  }
}