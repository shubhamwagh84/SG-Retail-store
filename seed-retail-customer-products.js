const mysql = require('mysql2/promise');

const products = [
  {id: 'p-301', name: 'Lighter', size: 'Bhari madhla', productType: 'Retail customer', price: 79, costPrice: 40, stock: 100, category: 'Kitchen'},
  {id: 'p-302', name: 'Thrums bottle', size: 'Bhari madhla', productType: 'Retail customer', price: 149, costPrice: 75, stock: 80, category: 'Storage'},
  {id: 'p-303', name: 'Mixture Bhande', size: 'Small', productType: 'Retail customer', price: 129, costPrice: 65, stock: 90, category: 'Storage'},
  {id: 'p-304', name: 'Mixture Bhande', size: 'Medium', productType: 'Retail customer', price: 159, costPrice: 80, stock: 90, category: 'Storage'},
  {id: 'p-305', name: 'Mixture Bhande', size: 'Big', productType: 'Retail customer', price: 199, costPrice: 100, stock: 70, category: 'Storage'},
  {id: 'p-306', name: 'Mixture Bhande', size: 'Big', productType: 'Retail customer', price: 199, costPrice: 100, stock: 70, category: 'Storage'},
  {id: 'p-307', name: 'Tiffin patti', size: 'Regular', productType: 'Retail customer', price: 89, costPrice: 45, stock: 100, category: 'Kitchen'},
  {id: 'p-308', name: 'Tiffin clip', size: 'Regular', productType: 'Retail customer', price: 69, costPrice: 35, stock: 120, category: 'Kitchen'}
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
  console.log('\n✅ All 8 Retail customer products inserted successfully!');
})();
