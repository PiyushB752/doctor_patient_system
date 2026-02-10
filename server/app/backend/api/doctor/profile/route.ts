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
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}