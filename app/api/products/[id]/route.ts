import { NextResponse } from "next/server";
import { deleteProduct, updateProduct, findProductInDb } from "@/lib/data";
import {
  fetchProductsFromSheet,
  isSheetsConfigured,
} from "@/lib/sheets";
import { Product } from "@/lib/types";
import { ensureSchema, isMySqlConfigured } from "@/lib/mysql";
import { memoryProducts, updateMemoryProducts } from "../../store";

async function findProduct(id: string): Promise<Product | undefined> {
  if (isMySqlConfigured()) {
    await ensureSchema();
    return findProductInDb(id);
  }

  if (isSheetsConfigured()) {
    const items = await fetchProductsFromSheet();
    return items.find((p) => p.id === id);
  }
  return memoryProducts.find((p) => p.id === id);
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("PATCH request for product ID:", id);
  
  const existing = await findProduct(id);
  if (!existing) {
    console.log("Product not found for ID:", id);
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  console.log("Existing product:", existing.name, "Current stock:", existing.stock);

  const body = await request.json();
  console.log("Request body:", body);
  
  // Support stockDelta for adding stock (used in stock purchase)
  const stockDelta = body.stockDelta !== undefined ? Number(body.stockDelta) : 0;
  console.log("Stock delta:", stockDelta);
  
  const newStock = body.stock !== undefined ? Number(body.stock) : (existing.stock + stockDelta);
  console.log("New stock will be:", newStock);
  
  const updated: Product = {
    ...existing,
    name: body.name ?? existing.name,
    variant: body.variant ?? existing.variant,
    category: body.category ?? existing.category,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    costPrice: body.costPrice !== undefined ? Number(body.costPrice) : existing.costPrice,
    stock: newStock,
    stockAlwaysNeeded: typeof body.stockAlwaysNeeded === "boolean" ? body.stockAlwaysNeeded : existing.stockAlwaysNeeded,
    reorderStatus: body.reorderStatus ?? existing.reorderStatus,
    notes: body.notes ?? existing.notes,
    photoUrl: body.photoUrl ?? existing.photoUrl,
    updatedAt: new Date().toISOString(),
  };

  console.log("Updated product object:", updated.name, "New stock:", updated.stock);

  const saved = await updateProduct(updated);
  
  console.log("Saved product:", saved.name, "Stock after save:", saved.stock);

  if (!isSheetsConfigured() && !isMySqlConfigured()) {
    updateMemoryProducts(memoryProducts.map((p) => (p.id === id ? saved : p)));
    console.log("Updated memory storage for product:", id);
  }

  console.log("Returning response with stock:", saved.stock);

  return NextResponse.json(saved);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSheetsConfigured() && !isMySqlConfigured()) {
    updateMemoryProducts(memoryProducts.filter((p) => p.id !== id));
    return NextResponse.json({ ok: true });
  }

  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
