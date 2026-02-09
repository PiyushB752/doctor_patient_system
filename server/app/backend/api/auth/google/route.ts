import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { verifyGoogleToken } from "../../../lib/google";
import { signToken } from "../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body?.token;
    const role = body?.role;

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

    const existingUserResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (existingUserResult.rows.length === 0) {
      const insertResult = await pool.query(
        `INSERT INTO users (email, name, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, name, role]
      );

      user = insertResult.rows[0];
    } else {
      user = existingUserResult.rows[0];
    }

    if (user.role === "doctor") {
      const doctorCheck = await pool.query(
        "SELECT id FROM doctors WHERE user_id = $1",
        [user.id]
      );

      if (doctorCheck.rows.length === 0) {
        await pool.query(
          "INSERT INTO doctors (user_id) VALUES ($1)",
          [user.id]
        );
      }
    }

    const jwtToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Google Auth Error:", error);

    return NextResponse.json(
      {
        error: "Authentication failed",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}