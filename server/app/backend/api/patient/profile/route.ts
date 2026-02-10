import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const user = verifyToken(req);

    if (user.role !== "patient") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT 
          p.patient_id,
          u.name,
          u.email,
          p.gender,
          p.date_of_birth
       FROM patients p
       JOIN users u ON u.user_id = p.user_id
       WHERE p.user_id = $1`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = verifyToken(req);

    if (user.role !== "patient") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const { gender, date_of_birth } = await req.json();

    await pool.query(
      `UPDATE patients
       SET gender = $1,
           date_of_birth = $2
       WHERE user_id = $3`,
      [gender, date_of_birth, user.userId]
    );

    return NextResponse.json({
      message: "Patient profile updated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}