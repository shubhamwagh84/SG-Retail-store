import { NextResponse } from "next/server";
import { Expense, Product } from "@/lib/types";
import { recordExpense, updateProduct, fetchExpensesFromDb, incrementProductStockInDb } from "@/lib/data";
import { memoryProducts, updateMemoryProducts } from "../store";
import { sampleExpenses } from "@/lib/sample";
import { ensureSchema, isMySqlConfigured } from "@/lib/mysql";

let memoryExpenses: Expense[] = [...sampleExpenses];

export async function GET() {
  if (isMySqlConfigured()) {
    await ensureSchema();
    const expenses = await fetchExpensesFromDb();
    return NextResponse.json(expenses);
  }
  return NextResponse.json(memoryExpenses);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, amount, description, date, paymentMethod, items } = body;

  if (!type || !amount || !date) {
    return NextResponse.json({ message: "type, amount, and date are required" }, { status: 400 });
  }

  const expense = await recordExpense({
    type,
    amount: Number(amount) || 0,
    description,
    date,
    paymentMethod: paymentMethod || "cash",
    items,
  });

  // If this is a stock purchase with items, update product stock server-side
  if (type === "stock_purchase" && Array.isArray(items)) {
    if (isMySqlConfigured()) {
      await ensureSchema();
      for (const item of items) {
        const qty = Number(item.qty) || 0;
        if (!qty) continue;
        await incrementProductStockInDb(item.productId, qty);
      }
    } else {
      const products: Product[] = memoryProducts;
      const updatedProducts: Product[] = [...products];

      for (const item of items) {
        const target = updatedProducts.find((p) => p.id === item.productId);
        if (!target) continue;
        const qty = Number(item.qty) || 0;
        const newStock = target.stock + qty;
        const saved = await updateProduct({ ...target, stock: newStock });
        const idx = updatedProducts.findIndex((p) => p.id === saved.id);
        if (idx !== -1) {
          updatedProducts[idx] = saved;
        }
      }

      updateMemoryProducts(updatedProducts);
    }
  }

  if (!isMySqlConfigured()) {
    memoryExpenses = [expense, ...memoryExpenses];
  }

  return NextResponse.json(expense, { status: 201 });
}
