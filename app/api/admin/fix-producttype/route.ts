import { NextResponse } from "next/server";
import { getPool, isMySqlConfigured, ensureSchema } from "@/lib/mysql";

export async function GET() {
  try {
    if (!isMySqlConfigured()) {
      return NextResponse.json({ error: "MySQL not configured" }, { status: 400 });
    }

    await ensureSchema();
    const pool = getPool();

    // Check current state
    const [checkRows]: any = await pool.execute(
      `SELECT COUNT(*) as total, SUM(CASE WHEN productType IS NULL OR productType = '' THEN 1 ELSE 0 END) as nullCount FROM products`
    );

    const totalProducts = checkRows[0].total;
    const nullCount = checkRows[0].nullCount;

    return NextResponse.json({
      total: totalProducts,
      nullProductType: nullCount,
      message: `${totalProducts} total products, ${nullCount} need productType`
    });
  } catch (error) {
    console.error("Check error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    if (!isMySqlConfigured()) {
      return NextResponse.json({ error: "MySQL not configured" }, { status: 400 });
    }

    await ensureSchema();
    const pool = getPool();

    // Update all NULL productType to "Regular"
    const [result]: any = await pool.execute(
      `UPDATE products SET productType = 'Regular' WHERE productType IS NULL OR productType = '' OR productType = 'undefined'`
    );

    return NextResponse.json({
      message: "Updated products with default productType",
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
