const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'SG Retail store',
    password: 'SGDB@11',
    database: 'SGDB',
  });

  const sql = "UPDATE products SET stock = 0, costPrice = 0, updatedAt = NOW() WHERE isDeleted = 0";
  const [result] = await pool.execute(sql);
  console.log(`Rows updated: ${result.affectedRows}`);
  await pool.end();
}

main().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
