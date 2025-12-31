const mysql = require('mysql2/promise');

const products = [
  {id: 'p-401', name: 'Kadai', size: 'Regular set', productType: 'Non stick', price: 249, costPrice: 125, stock: 60, category: 'Cookware'},
  {id: 'p-402', name: 'Toop', size: 'Regular set', productType: 'Non stick', price: 199, costPrice: 100, stock: 70, category: 'Cookware'},
  {id: 'p-403', name: 'Tawa', size: '14 No/ 4 mm', productType: 'Non stick', price: 179, costPrice: 90, stock: 80, category: 'Cookware'},
  {id: 'p-404', name: 'Fry pan', size: 'Regular', productType: 'Non stick', price: 189, costPrice: 95, stock: 75, category: 'Cookware'},
  {id: 'p-405', name: 'Dosa Tawa', size: '14 No/ 4 mm', productType: 'Non stick', price: 169, costPrice: 85, stock: 85, category: 'Cookware'}
];

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'SG Retail store',
    password: 'SGDB@11',
    database: 'SGDB'
  });

  for (const p of products) {
    const sql = 'INSERT INTO products (id, name, size, productType, price, costPrice, stock, category, isDeleted, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW()) ON DUPLICATE KEY UPDATE productType=VALUES(productType), price=VALUES(price), costPrice=VALUES(costPrice), stock=VALUES(stock)';
    const [r] = await pool.execute(sql, [p.id, p.name, p.size, p.productType, p.price, p.costPrice, p.stock, p.category]);
    console.log(p.name + ' (' + p.size + ') - ' + (r.affectedRows === 1 ? 'inserted' : 'updated'));
  }

  await pool.end();
  console.log('\n✅ All 5 Non stick products inserted successfully!');
})();
