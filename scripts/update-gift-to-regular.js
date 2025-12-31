const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'SG Retail store',
    password: 'SGDB@11',
    database: 'SGDB',
  });

  const sql = "UPDATE products SET productType='Regular' WHERE productType='Gift'";
  const [result] = await pool.execute(sql);
  console.log(`Updated rows: ${result.affectedRows}`);
  await pool.end();
}

main().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
