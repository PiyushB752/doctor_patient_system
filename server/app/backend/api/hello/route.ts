import { NextResponse } from "next/server";
import pool from "../../lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");
    
    return NextResponse.json({
      message: "hello World",
      dbstatus: "Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}