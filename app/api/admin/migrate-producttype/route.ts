import { NextResponse } from "next/server";
import { getPool, ensureSchema } from "@/lib/mysql";

export async function POST() {
  try {
    await ensureSchema();
    const pool = getPool();

    // Update all products with NULL or empty productType to "Regular"
    const [result]: any = await pool.execute(
      `UPDATE products SET productType = ? WHERE productType IS NULL OR productType = ''`,
      ['Regular']
    );

    return NextResponse.json({ 
      message: "Migration completed", 
      updated: result.affectedRows 
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
