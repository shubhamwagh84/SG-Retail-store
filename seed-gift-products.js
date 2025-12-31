const mysql = require('mysql2/promise');

const products = [
  {id: 'p-201', name: 'Panchpatri/Pawali', size: '14 - 18 No', productType: 'Gift', price: 199, costPrice: 100, stock: 50, category: 'Cookware'},
  {id: 'p-202', name: 'Panchpatri/Pawali', size: '20 - 24 No', productType: 'Gift', price: 249, costPrice: 125, stock: 50, category: 'Cookware'},
  {id: 'p-203', name: 'Alu Dabba', size: '19-24 No', productType: 'Gift', price: 179, costPrice: 90, stock: 60, category: 'Storage'},
  {id: 'p-204', name: 'Alu Dabba', size: '25-28 No', productType: 'Gift', price: 219, costPrice: 110, stock: 60, category: 'Storage'},
  {id: 'p-205', name: 'Steel Dabba', size: '19-24 No', productType: 'Gift', price: 189, costPrice: 95, stock: 60, category: 'Storage'},
  {id: 'p-206', name: 'Steel Dabba', size: '25-28 No', productType: 'Gift', price: 229, costPrice: 115, stock: 60, category: 'Storage'},
  {id: 'p-207', name: 'Idli Pot', size: '12 No', productType: 'Gift', price: 159, costPrice: 80, stock: 70, category: 'Cookware'},
  {id: 'p-208', name: 'Idli Pot', size: '16 No', productType: 'Gift', price: 189, costPrice: 95, stock: 70, category: 'Cookware'},
  {id: 'p-209', name: 'Idli Pot', size: '20 No', productType: 'Gift', price: 219, costPrice: 110, stock: 70, category: 'Cookware'},
  {id: 'p-210', name: 'Appe patr', size: 'Regular', productType: 'Gift', price: 149, costPrice: 75, stock: 80, category: 'Cookware'},
  {id: 'p-211', name: 'Appe patr', size: 'Regular', productType: 'Gift', price: 149, costPrice: 75, stock: 80, category: 'Cookware'},
  {id: 'p-212', name: 'Steel Handa', size: 'Medium Size', productType: 'Gift', price: 169, costPrice: 85, stock: 65, category: 'Cookware'},
  {id: 'p-213', name: 'Steel Handa', size: 'Big size - Nashik Ghat (Laxmi)', productType: 'Gift', price: 199, costPrice: 100, stock: 65, category: 'Cookware'},
  {id: 'p-214', name: 'Steel Kalshi', size: 'Regular size', productType: 'Gift', price: 139, costPrice: 70, stock: 75, category: 'Cookware'},
  {id: 'p-215', name: 'Dinner set', size: 'Regular', productType: 'Gift', price: 399, costPrice: 200, stock: 40, category: 'Cookware'},
  {id: 'p-216', name: 'Mix idli/dhokla/ multi kadai', size: 'Regular', productType: 'Gift', price: 279, costPrice: 140, stock: 45, category: 'Cookware'},
  {id: 'p-217', name: 'POT (Poli Dabba)', size: 'Plastic', productType: 'Gift', price: 89, costPrice: 45, stock: 100, category: 'Storage'},
  {id: 'p-218', name: 'Dhokala Bhandi', size: 'Regular', productType: 'Gift', price: 159, costPrice: 80, stock: 70, category: 'Cookware'}
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
  console.log('\n✅ All 18 Gift products inserted successfully!');
})();
