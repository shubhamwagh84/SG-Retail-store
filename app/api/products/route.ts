import { NextResponse } from "next/server";
import { fetchProductsFromDb, persistProduct } from "@/lib/data";
import {
  fetchProductsFromSheet,
  isSheetsConfigured,
} from "@/lib/sheets";
import { Product } from "@/lib/types";
import { ensureSchema, isMySqlConfigured } from "@/lib/mysql";
import { memoryProducts, updateMemoryProducts } from "../store";

export async function GET() {
  if (isMySqlConfigured()) {
    await ensureSchema();
    const products = await fetchProductsFromDb();
    return NextResponse.json(products);
  }

  if (isSheetsConfigured()) {
    const products = await fetchProductsFromSheet();
    console.log("GET /api/products - Returning from Sheets:", products.length, "products");
    return NextResponse.json(products);
  }
  console.log("GET /api/products - Returning from memory:", memoryProducts.length, "products");
  console.log("Memory products detail:", memoryProducts.map(p => ({ name: p.name, stock: p.stock })));
  return NextResponse.json(memoryProducts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, variant, size, pattern, productType, design, category, price, costPrice, stock, avgStockNeeded, stockAlwaysNeeded, reorderStatus, notes, photoUrl } = body;

  if (!name || !category) {
    return NextResponse.json({ message: "Name and category are required" }, { status: 400 });
  }

  const product = await persistProduct({
    name,
    variant,
    size,
    pattern,
    productType,
    design,
    category,
    price: Number(price) || 0,
    costPrice: Number(costPrice) || 0,
    stock: Number(stock) || 0,
    avgStockNeeded: typeof avgStockNeeded === "number" ? avgStockNeeded : undefined,
    stockAlwaysNeeded: typeof stockAlwaysNeeded === "boolean" ? stockAlwaysNeeded : undefined,
    reorderStatus,
    notes,
    photoUrl,
  });

  if (!isSheetsConfigured() && !isMySqlConfigured()) {
    updateMemoryProducts([product, ...memoryProducts]);
  }

  return NextResponse.json(product, { status: 201 });
}
