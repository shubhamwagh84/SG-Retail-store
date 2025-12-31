import { NextResponse } from "next/server";
import { getPool, isMySqlConfigured } from "@/lib/mysql";

export async function POST() {
  try {
    if (!isMySqlConfigured()) {
      return NextResponse.json({ error: "MySQL not configured" }, { status: 400 });
    }

    const pool = getPool();

    // Step 1: Add productType column if it doesn't exist
    try {
      await pool.execute(
        `ALTER TABLE products ADD COLUMN productType VARCHAR(64) DEFAULT 'Regular'`
      );
      console.log("Added productType column");
    } catch (err: any) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("productType column already exists");
      } else {
        throw err;
      }
    }

    // Step 2: Update all products with NULL productType to "Regular"
    const [result]: any = await pool.execute(
      `UPDATE products SET productType = 'Regular' WHERE productType IS NULL`
    );

    return NextResponse.json({
      message: "Migration completed",
      updated: result.affectedRows || 0,
      status: "success"
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: String(error), status: "failed" },
      { status: 500 }
    );
  }
}
