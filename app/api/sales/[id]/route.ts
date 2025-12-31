import { NextResponse } from "next/server";
import { getPool, isMySqlConfigured } from "@/lib/mysql";
import { memorySales, updateMemorySales, memoryProducts, updateMemoryProducts } from "../../store";
import { Sale } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params;
  
  if (isMySqlConfigured()) {
    const pool = getPool();
    const [[sale]] = await pool.execute<any>(
      "SELECT * FROM sales WHERE id = ?",
      [saleId]
    );
    
    if (!sale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }
    
    return NextResponse.json(sale);
  }

  const sale = memorySales.find((s) => s.id === saleId);
  if (!sale) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json(sale);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params;
  const body = await request.json();
  const { qty, amount } = body;

  if (typeof qty === "undefined" && typeof amount === "undefined") {
    return NextResponse.json(
      { message: "Either qty or amount must be provided" },
      { status: 400 }
    );
  }

  if (isMySqlConfigured()) {
    const pool = getPool();
    
    // Get the original sale to restore stock if needed
    const [[originalSale]] = await pool.execute<any>(
      "SELECT * FROM sales WHERE id = ?",
      [saleId]
    );

    if (!originalSale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    // Update the sale
    const updates: string[] = [];
    const values: any[] = [];

    if (typeof qty !== "undefined") {
      updates.push("qty = ?");
      values.push(Number(qty));
    }
    if (typeof amount !== "undefined") {
      updates.push("amount = ?");
      values.push(Number(amount));
    }

    values.push(saleId);

    await pool.execute(
      `UPDATE sales SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Restore stock for old quantity and deduct for new quantity
    if (typeof qty !== "undefined" && qty !== originalSale.qty) {
      const qtyDifference = originalSale.qty - qty;
      await pool.execute(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        [qtyDifference, originalSale.productId]
      );
    }

    const [[updatedSale]] = await pool.execute<any>(
      "SELECT * FROM sales WHERE id = ?",
      [saleId]
    );

    return NextResponse.json(updatedSale);
  }

  // Memory storage update
  const saleIndex = memorySales.findIndex((s) => s.id === saleId);
  if (saleIndex === -1) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  const originalSale = memorySales[saleIndex];
  const updatedSale: Sale = {
    ...originalSale,
    qty: typeof qty !== "undefined" ? Number(qty) : originalSale.qty,
    amount: typeof amount !== "undefined" ? Number(amount) : originalSale.amount,
  };

  updateMemorySales([
    ...memorySales.slice(0, saleIndex),
    updatedSale,
    ...memorySales.slice(saleIndex + 1),
  ]);

  // Update stock if qty changed
  if (typeof qty !== "undefined" && qty !== originalSale.qty) {
    const qtyDifference = originalSale.qty - qty;
    updateMemoryProducts(
      memoryProducts.map((p) =>
        p.id === originalSale.productId
          ? { ...p, stock: Math.max(0, p.stock + qtyDifference) }
          : p
      )
    );
  }

  return NextResponse.json(updatedSale);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params;

  if (isMySqlConfigured()) {
    const pool = getPool();
    
    // Get the sale before deleting to restore stock
    const [[sale]] = await pool.execute<any>(
      "SELECT * FROM sales WHERE id = ?",
      [saleId]
    );

    if (!sale) {
      return NextResponse.json({ message: "Sale not found" }, { status: 404 });
    }

    // Delete the sale
    await pool.execute("DELETE FROM sales WHERE id = ?", [saleId]);

    // Restore stock
    await pool.execute(
      "UPDATE products SET stock = stock + ? WHERE id = ?",
      [sale.qty, sale.productId]
    );

    return NextResponse.json({ message: "Sale deleted successfully" });
  }

  // Memory storage delete
  const saleIndex = memorySales.findIndex((s) => s.id === saleId);
  if (saleIndex === -1) {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }

  const deletedSale = memorySales[saleIndex];

  updateMemorySales([
    ...memorySales.slice(0, saleIndex),
    ...memorySales.slice(saleIndex + 1),
  ]);

  // Restore stock
  updateMemoryProducts(
    memoryProducts.map((p) =>
      p.id === deletedSale.productId
        ? { ...p, stock: Math.max(0, p.stock + deletedSale.qty) }
        : p
    )
  );

  return NextResponse.json({ message: "Sale deleted successfully" });
}
