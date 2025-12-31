import { google } from "googleapis";
import { Product, Sale } from "./types";

const PRODUCT_RANGE = "Products!A2:L";
const SALES_RANGE = "Sales!A2:G";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

function getEnv(key: string): string | undefined {
  const value = process.env[key];
  return value?.trim() ? value.trim() : undefined;
}

export function isSheetsConfigured() {
  return (
    !!getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL") &&
    !!getEnv("GOOGLE_PRIVATE_KEY") &&
    !!getEnv("GOOGLE_SHEETS_SPREADSHEET_ID")
  );
}

function getClient() {
  const email = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const key = getEnv("GOOGLE_PRIVATE_KEY");
  const spreadsheetId = getEnv("GOOGLE_SHEETS_SPREADSHEET_ID");

  if (!email || !key || !spreadsheetId) {
    throw new Error("Google Sheets is not configured");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, spreadsheetId };
}

function mapProductRow(row: string[]): Product {
  const [id, name, variant, category, price, costPrice, stock, stockAlwaysNeeded, reorderStatus, notes, photoUrl, updatedAt] = row;
  return {
    id,
    name,
    variant,
    category,
    price: Number(price) || 0,
    costPrice: Number(costPrice) || 0,
    stock: Number(stock) || 0,
    stockAlwaysNeeded: stockAlwaysNeeded === "true" ? true : stockAlwaysNeeded === "false" ? false : undefined,
    reorderStatus,
    notes,
    photoUrl,
    updatedAt: updatedAt || new Date().toISOString(),
  };
}

function mapSaleRow(row: string[]): Sale {
  const [id, productId, qty, amount, soldAt, note, user] = row;
  return {
    id,
    productId,
    qty: Number(qty) || 0,
    amount: Number(amount) || 0,
    soldAt: soldAt || new Date().toISOString(),
    note,
    user,
  };
}

export async function fetchProductsFromSheet(): Promise<Product[]> {
  const { sheets, spreadsheetId } = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: PRODUCT_RANGE,
  });

  const rows = res.data.values || [];
  return rows.filter(Boolean).map(mapProductRow);
}

export async function fetchSalesFromSheet(): Promise<Sale[]> {
  const { sheets, spreadsheetId } = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SALES_RANGE,
  });

  const rows = res.data.values || [];
  return rows.filter(Boolean).map(mapSaleRow);
}

export async function appendProductToSheet(product: Product) {
  const { sheets, spreadsheetId } = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: PRODUCT_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          product.id,
          product.name,
          product.variant ?? "",
          product.category,
          product.price,
          product.costPrice,
          product.stock,
          product.stockAlwaysNeeded === undefined ? "" : String(product.stockAlwaysNeeded),
          product.reorderStatus ?? "",
          product.notes ?? "",
          product.photoUrl ?? "",
          product.updatedAt,
        ],
      ],
    },
  });
}

export async function updateProductInSheet(product: Product) {
  const { sheets, spreadsheetId } = getClient();
  const existing = await fetchProductsFromSheet();
  const index = existing.findIndex((p) => p.id === product.id);
  if (index === -1) {
    throw new Error("Product not found in sheet");
  }
  const rowNumber = index + 2; // header is row 1
  console.log(`Updating product in Sheets: ${product.name} (row ${rowNumber}), new stock: ${product.stock}`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Products!A${rowNumber}:L${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          product.id,
          product.name,
          product.variant ?? "",
          product.category,
          product.price,
          product.costPrice,
          product.stock,
          product.stockAlwaysNeeded === undefined ? "" : String(product.stockAlwaysNeeded),
          product.reorderStatus ?? "",
          product.notes ?? "",
          product.photoUrl ?? "",
          product.updatedAt,
        ],
      ],
    },
  });
  console.log(`Product updated in Sheets successfully: ${product.name}`);
}

export async function clearProductRow(productId: string) {
  const { sheets, spreadsheetId } = getClient();
  const existing = await fetchProductsFromSheet();
  const index = existing.findIndex((p) => p.id === productId);
  if (index === -1) {
    return;
  }
  const rowNumber = index + 2;
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `Products!A${rowNumber}:L${rowNumber}`,
  });
}

export async function appendSaleToSheet(sale: Sale) {
  const { sheets, spreadsheetId } = getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: SALES_RANGE,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          sale.id,
          sale.productId,
          sale.qty,
          sale.amount,
          sale.soldAt,
          sale.note ?? "",
          sale.user ?? "",
        ],
      ],
    },
  });
}
