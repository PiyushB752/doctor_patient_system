import { NextResponse } from "next/server";
import pool from "../../lib/db";
import { verifyGoogleToken } from "../../lib/google";
import { signToken } from "../../lib/jwt";

export async function POST(req: Request){
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

    if (!payload || !payload.email || !payload.sub) {
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 401 }
      );
    }

    const email = payload.email;
    const name = payload.name || "Unknown";
    const providerId = payload.sub;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let user;

    if (existingUser.rows.length === 0) {
      const result = await pool.query(
        `INSERT INTO users (email, name, role, provider, provider_id)
         VALUES ($1, $2, $3, 'google', $4)
         RETURNING *`,
        [email, name, role, providerId]
      );

      user = result.rows[0];
    } else {
      user = existingUser.rows[0];
    }

    const sessionToken = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token: sessionToken,
      user: {
        id: user.id,
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