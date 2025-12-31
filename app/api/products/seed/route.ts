import { NextResponse } from "next/server";
import { ensureSchema, getPool, isMySqlConfigured } from "@/lib/mysql";
import { sampleProducts } from "@/lib/sample";

export async function POST() {
  if (!isMySqlConfigured()) {
    return NextResponse.json({ message: "MySQL is not configured. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env.local" }, { status: 400 });
  }

  await ensureSchema();
  const pool = getPool();

  let inserted = 0;
  let updated = 0;

  for (const p of sampleProducts) {
    // Convert ISO string to MySQL datetime format
    const updatedAt = new Date(p.updatedAt).toISOString().slice(0, 19).replace('T', ' ');
    
    const values = [
      p.id,
      p.name,
      p.variant ?? null,
      p.size ?? null,
      p.pattern ?? null,
      p.productType ?? null,
      p.design ?? null,
      p.category,
      p.price,
      p.costPrice,
      p.stock,
      p.stockAlwaysNeeded ?? null,
      p.avgStockNeeded ?? null,
      p.reorderStatus ?? null,
      p.notes ?? null,
      p.photoUrl ?? null,
      updatedAt,
    ];

    const [result]: any = await pool.execute(
      `INSERT INTO products (id, name, variant, size, pattern, productType, design, category, price, costPrice, stock, stockAlwaysNeeded, avgStockNeeded, reorderStatus, notes, photoUrl, updatedAt, isDeleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         variant = VALUES(variant),
         size = VALUES(size),
         pattern = VALUES(pattern),
         productType = VALUES(productType),
         design = VALUES(design),
         category = VALUES(category),
         price = VALUES(price),
         costPrice = VALUES(costPrice),
         stock = VALUES(stock),
         stockAlwaysNeeded = VALUES(stockAlwaysNeeded),
         avgStockNeeded = VALUES(avgStockNeeded),
         reorderStatus = VALUES(reorderStatus),
         notes = VALUES(notes),
         photoUrl = VALUES(photoUrl),
         updatedAt = VALUES(updatedAt),
         isDeleted = 0`,
      values
    );

    // result.affectedRows: 1 for insert, 2 for update (insert+update). Insert-id not used because PK provided.
    if (result.affectedRows === 1) inserted += 1;
    else if (result.affectedRows === 2) updated += 1;
  }

  return NextResponse.json({ message: "Seed completed", inserted, updated, total: sampleProducts.length });
}
