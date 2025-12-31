const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'SG Retail store',
    password: 'SGDB@11',
    database: 'SGDB'
  });

  console.log('\n=== Products by Type ===');
  const [rows] = await pool.execute('SELECT COUNT(*) as total, productType FROM products GROUP BY productType');
  rows.forEach(r => console.log(r.productType + ': ' + r.total));

  console.log('\n=== First 3 Gift Products ===');
  const [gifts] = await pool.execute('SELECT id, name, productType FROM products WHERE productType = "Gift" LIMIT 3');
  gifts.forEach(g => console.log(g.id + ' - ' + g.name));

  await pool.end();
})();
