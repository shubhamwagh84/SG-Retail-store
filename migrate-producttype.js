const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

async function migrate() {
  const env = loadEnv();
  const pool = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  try {
    const connection = await pool.getConnection();
    
    // Update all products with NULL or empty productType to "Regular"
    const [result] = await connection.execute(
      `UPDATE products SET productType = ? WHERE productType IS NULL OR productType = ''`,
      ['Regular']
    );
    
    console.log(`Updated ${result.affectedRows} products with productType = 'Regular'`);
    
    // Show some products
    const [rows] = await connection.execute(
      `SELECT id, name, productType FROM products LIMIT 5`
    );
    
    console.log('\nSample products:');
    rows.forEach(row => {
      console.log(`  ${row.id}: ${row.name} - ${row.productType}`);
    });
    
    connection.release();
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
