import { v4 as uuid } from "uuid";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { sampleProducts, sampleSales } from "./sample";
import {
  appendProductToSheet,
  appendSaleToSheet,
  clearProductRow,
  fetchProductsFromSheet,
  fetchSalesFromSheet,
  isSheetsConfigured,
  updateProductInSheet,
} from "./sheets";
import { getPool, ensureSchema, isMySqlConfigured } from "./mysql";
import { Product, Sale, PortalConfig, Expense } from "./types";

function toMySqlDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  // Format as "YYYY-MM-DD HH:MM:SS" for strict MySQL DATETIME
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export async function loadPortalData() {
  const sheetsConfigured = isSheetsConfigured();
  const mysqlConfigured = isMySqlConfigured();
  let products: Product[] = sampleProducts;
  let sales: Sale[] = sampleSales;

  if (mysqlConfigured) {
    try {
      await ensureSchema();
      products = await fetchProductsFromDb();
      sales = await fetchSalesFromDb();
    } catch (error) {
      console.error("MySQL read failed, falling back", error);
    }
  } else if (sheetsConfigured) {
    try {
      products = await fetchProductsFromSheet();
      sales = await fetchSalesFromSheet();
    } catch (error) {
      console.error("Sheets read failed, using sample data", error);
    }
  }

  const config: PortalConfig = {
    sheetsConfigured,
    storageConfigured: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };

  return { products, sales, config };
}

export async function persistProduct(product: Omit<Product, "id" | "updatedAt">) {
  const item: Product = {
    ...product,
    id: uuid(),
    updatedAt: new Date().toISOString(),
  };

  if (isMySqlConfigured()) {
    await ensureSchema();
    await insertProductToDb(item);
    return item;
  }

  if (isSheetsConfigured()) {
    await appendProductToSheet(item);
  }

  return item;
}

export async function updateProduct(product: Product) {
  const updated: Product = {
    ...product,
    updatedAt: new Date().toISOString(),
  };
  if (isMySqlConfigured()) {
    await ensureSchema();
    await updateProductInDb(updated);
    return updated;
  }
  if (isSheetsConfigured()) {
    await updateProductInSheet(updated);
  }
  return updated;
}

export async function deleteProduct(productId: string) {
  if (isMySqlConfigured()) {
    await ensureSchema();
    await deleteProductFromDb(productId);
    return;
  }
  if (isSheetsConfigured()) {
    await clearProductRow(productId);
  }
}

export async function recordSale(entry: Omit<Sale, "id"> & { soldAt?: string }) {
  const sale: Sale = {
    ...entry,
    id: uuid(),
    soldAt: entry.soldAt || new Date().toISOString(),
  };
  if (isMySqlConfigured()) {
    await ensureSchema();
    await insertSaleToDb(sale);
    await decrementProductStockInDb(sale.productId, sale.qty);
    return sale;
  }

  if (isSheetsConfigured()) {
    await appendSaleToSheet(sale);
    try {
      const products = await fetchProductsFromSheet();
      const product = products.find((p) => p.id === sale.productId);
      if (product) {
        await updateProduct({
          ...product,
          stock: Math.max(0, product.stock - sale.qty),
        });
      }
    } catch (error) {
      console.error("Failed to update product stock after sale", error);
    }
  }

  return sale;
}

export async function recordExpense(entry: Omit<Expense, "id">) {
  const expense: Expense = {
    ...entry,
    id: uuid(),
  };

  if (isMySqlConfigured()) {
    await ensureSchema();
    await insertExpenseToDb(expense);
  }

  // Future: persist to Sheets if configured
  return expense;
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    variant: row.variant ?? undefined,
    size: row.size ?? undefined,
    pattern: row.pattern ?? undefined,
    productType: row.productType ?? undefined,
    design: row.design ?? undefined,
    category: row.category,
    price: Number(row.price ?? 0),
    costPrice: Number(row.costPrice ?? 0),
    stock: Number(row.stock ?? 0),
    stockAlwaysNeeded: row.stockAlwaysNeeded === null ? undefined : Boolean(row.stockAlwaysNeeded),
    avgStockNeeded: row.avgStockNeeded === null ? undefined : Number(row.avgStockNeeded),
    reorderStatus: row.reorderStatus ?? undefined,
    notes: row.notes ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    updatedAt: row.updatedAt
      ? new Date(row.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

function mapSale(row: any): Sale {
  return {
    id: row.id,
    productId: row.productId,
    qty: Number(row.qty ?? 0),
    amount: Number(row.amount ?? 0),
    paymentMethod: row.paymentMethod ?? undefined,
    soldAt: row.soldAt ? new Date(row.soldAt).toISOString() : new Date().toISOString(),
    note: row.note ?? undefined,
    user: row.user ?? undefined,
  };
}

function mapExpense(row: any): Expense {
  let items: any = undefined;
  if (row.items !== null && row.items !== undefined) {
    if (typeof row.items === "string") {
      try {
        items = JSON.parse(row.items);
      } catch (err) {
        console.error("Failed to parse expense items", err);
        items = undefined;
      }
    } else {
      // MySQL JSON columns come back as objects; keep as-is
      items = row.items;
    }
  }

  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount ?? 0),
    paymentMethod: row.paymentMethod ?? "cash",
    description: row.description ?? undefined,
    date: row.date ? new Date(row.date).toISOString().slice(0, 10) : "",
    items,
  };
}

export async function fetchProductsFromDb(): Promise<Product[]> {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM products WHERE isDeleted = 0 ORDER BY updatedAt DESC"
  );
  return rows.map(mapProduct);
}

export async function findProductInDb(id: string): Promise<Product | undefined> {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
  if (!rows.length) return undefined;
  return mapProduct(rows[0]);
}

export async function findProductInDbIncludingDeleted(id: string): Promise<Product | undefined> {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
  if (!rows.length) return undefined;
  return mapProduct(rows[0]);
}

async function insertProductToDb(product: Product) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO products (id, name, variant, size, pattern, productType, design, category, price, costPrice, stock, stockAlwaysNeeded, avgStockNeeded, reorderStatus, notes, photoUrl, updatedAt, isDeleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)` ,
    [
      product.id,
      product.name,
      product.variant ?? null,
      product.size ?? null,
      product.pattern ?? null,
      product.productType ?? null,
      product.design ?? null,
      product.category,
      product.price,
      product.costPrice,
      product.stock,
      product.stockAlwaysNeeded ?? null,
      product.avgStockNeeded ?? null,
      product.reorderStatus ?? null,
      product.notes ?? null,
      product.photoUrl ?? null,
      toMySqlDateTime(product.updatedAt),
    ]
  );
}

async function updateProductInDb(product: Product) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute(
    `UPDATE products SET name = ?, variant = ?, size = ?, pattern = ?, productType = ?, design = ?, category = ?, price = ?, costPrice = ?, stock = ?, stockAlwaysNeeded = ?, avgStockNeeded = ?, reorderStatus = ?, notes = ?, photoUrl = ?, updatedAt = ? WHERE id = ?`,
    [
      product.name,
      product.variant ?? null,
      product.size ?? null,
      product.pattern ?? null,
      product.productType ?? null,
      product.design ?? null,
      product.category,
      product.price,
      product.costPrice,
      product.stock,
      product.stockAlwaysNeeded ?? null,
      product.avgStockNeeded ?? null,
      product.reorderStatus ?? null,
      product.notes ?? null,
      product.photoUrl ?? null,
      toMySqlDateTime(product.updatedAt),
      product.id,
    ]
  );
}

async function deleteProductFromDb(productId: string) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute("UPDATE products SET isDeleted = 1, updatedAt = UTC_TIMESTAMP() WHERE id = ?", [productId]);
}

export async function fetchSalesFromDb(): Promise<Sale[]> {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM sales ORDER BY soldAt DESC"
  );
  return rows.map(mapSale);
}

async function insertSaleToDb(sale: Sale) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sale.id,
      sale.productId,
      sale.qty,
      sale.amount,
      sale.paymentMethod ?? null,
      toMySqlDateTime(sale.soldAt),
      sale.note ?? null,
      sale.user ?? null,
    ]
  );
}

async function decrementProductStockInDb(productId: string, qty: number) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute(
    `UPDATE products SET stock = GREATEST(0, stock - ?), updatedAt = UTC_TIMESTAMP() WHERE id = ?`,
    [qty, productId]
  );
}

export async function fetchExpensesFromDb(): Promise<Expense[]> {
  await ensureSchema();
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM expenses ORDER BY date DESC, id DESC"
  );
  return rows.map(mapExpense);
}

async function insertExpenseToDb(expense: Expense) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute(
    `INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ,
    [
      expense.id,
      expense.type,
      expense.amount,
      expense.paymentMethod ?? null,
      expense.description ?? null,
      expense.date,
      expense.items ? JSON.stringify(expense.items) : null,
    ]
  );
}

export async function incrementProductStockInDb(productId: string, qty: number) {
  await ensureSchema();
  const pool = getPool();
  await pool.execute(
    `UPDATE products SET stock = stock + ?, updatedAt = UTC_TIMESTAMP() WHERE id = ?`,
    [qty, productId]
  );
}
