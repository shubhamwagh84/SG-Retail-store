import { NextResponse } from "next/server";
import { fetchSalesFromDb, recordSale } from "@/lib/data";
import { fetchSalesFromSheet, isSheetsConfigured } from "@/lib/sheets";
import { memoryProducts, memorySales, updateMemoryProducts, updateMemorySales } from "../store";
import { Sale, Product } from "@/lib/types";
import { ensureSchema, isMySqlConfigured } from "@/lib/mysql";

export async function GET() {
  if (isMySqlConfigured()) {
    await ensureSchema();
    const sales = await fetchSalesFromDb();
    return NextResponse.json(sales);
  }

  if (isSheetsConfigured()) {
    const sales = await fetchSalesFromSheet();
    return NextResponse.json(sales);
  }
  return NextResponse.json(memorySales);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, qty, amount, paymentMethod, note, user, soldAt } = body;

  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  const sale = await recordSale({
    productId,
    qty: Number(qty) || 0,
    amount: Number(amount) || 0,
    paymentMethod: paymentMethod || "cash",
    note,
    user,
    soldAt: soldAt || new Date().toISOString(),
  });

  if (!isSheetsConfigured() && !isMySqlConfigured()) {
    updateMemorySales([sale, ...memorySales]);
    
    // Update in-memory product stock
    updateMemoryProducts(
      memoryProducts.map((p) =>
        p.id === sale.productId
          ? { ...p, stock: Math.max(0, p.stock - sale.qty), updatedAt: sale.soldAt }
          : p
      )
    );
  }

  return NextResponse.json(sale, { status: 201 });
}
