import mysql, { Pool } from "mysql2/promise";

let pool: Pool | null = null;
let schemaEnsured = false;

function clean(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function isMySqlConfigured(): boolean {
  const host = clean(process.env.DB_HOST);
  const user = clean(process.env.DB_USER);
  const password = process.env.DB_PASSWORD?.trim() ?? "";
  const database = clean(process.env.DB_NAME);
  return Boolean(host && user && password && database);
}

export function getPool(): Pool {
  if (!isMySqlConfigured()) {
    throw new Error("MySQL is not configured");
  }
  if (!pool) {
    const poolConfig: any = {
      host: clean(process.env.DB_HOST),
      port: Number(process.env.DB_PORT || 3306),
      user: clean(process.env.DB_USER),
      password: process.env.DB_PASSWORD,
      database: clean(process.env.DB_NAME),
      waitForConnections: true,
      connectionLimit: 10,
      timezone: "Z",
    };
    
    // Enable SSL for PlanetScale or remote databases
    if (process.env.DB_HOST && process.env.DB_HOST.includes("psdb.cloud")) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
      };
    }
    
    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

export async function ensureSchema() {
  if (!isMySqlConfigured() || schemaEnsured) return;
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      variant VARCHAR(255),
      size VARCHAR(64),
      pattern VARCHAR(64),
      productType VARCHAR(64),
      design VARCHAR(255),
      category VARCHAR(128) NOT NULL,
      price DOUBLE NOT NULL DEFAULT 0,
      costPrice DOUBLE NOT NULL DEFAULT 0,
      stock INT NOT NULL DEFAULT 0,
      stockAlwaysNeeded TINYINT(1),
      avgStockNeeded INT,
      reorderStatus VARCHAR(64),
      notes TEXT,
      photoUrl TEXT,
      updatedAt DATETIME NOT NULL,
      isDeleted TINYINT(1) DEFAULT 0
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sales (
      id VARCHAR(64) PRIMARY KEY,
      productId VARCHAR(64) NOT NULL,
      qty INT NOT NULL,
      amount DOUBLE NOT NULL,
      paymentMethod VARCHAR(32),
      soldAt DATETIME NOT NULL,
      note TEXT,
      user VARCHAR(128),
      INDEX idx_sales_product (productId)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(64) PRIMARY KEY,
      type VARCHAR(64) NOT NULL,
      amount DOUBLE NOT NULL,
      paymentMethod VARCHAR(32),
      description TEXT,
      date DATE NOT NULL,
      items JSON
    )
  `);

  schemaEnsured = true;
}
