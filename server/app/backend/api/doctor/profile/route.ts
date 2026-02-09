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
      `SELECT d.id, u.name, u.email,
              d.specialization, d.experience,
              d.consultation_fee, d.bio
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       WHERE d.user_id = $1`,
      [user.userId]
    );

    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}