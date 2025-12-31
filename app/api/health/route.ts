import { NextResponse } from "next/server";
import { ensureSchema, getPool, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  if (!isMySqlConfigured()) {
    return NextResponse.json({
      mysqlConfigured: false,
      mysqlHealthy: false,
      message: "MySQL env vars not set",
    });
  }

  try {
    await ensureSchema();
    const pool = getPool();
    await pool.query("SELECT 1");
    return NextResponse.json({ mysqlConfigured: true, mysqlHealthy: true });
  } catch (error: unknown) {
    console.error("MySQL health check failed", error);
    return NextResponse.json(
      {
        mysqlConfigured: true,
        mysqlHealthy: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
