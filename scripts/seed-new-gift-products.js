const mysql = require('mysql2/promise');

const products = [
  { id: 'p-601', name: 'Panchpatri/Pawali', size: '14 - 18 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-602', name: 'Panchpatri/Pawali', size: '20 - 24 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-603', name: 'Alu Dabba', size: '19-24 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-604', name: 'Alu Dabba', size: '25-28 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-605', name: 'Steel Dabba', size: '19-24 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-606', name: 'Steel Dabba', size: '25-28 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-607', name: 'Idli Pot', size: '12 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-608', name: 'Idli Pot', size: '16 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-609', name: 'Idli Pot', size: '20 No', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-610', name: 'Appe patr', size: 'Regular', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-611', name: 'Appe patr', size: 'Regular', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-612', name: 'Steel Handa', size: 'Medium Size', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-613', name: 'Steel Handa', size: 'Big size - Nashik Ghat ( Laxmi)', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-614', name: 'Steel Kalshi', size: 'Regular size', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-615', name: 'Dinner set', size: 'Regular', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-616', name: 'Mix idli/dhokla/ multi kadai', size: 'Regular', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-617', name: 'POT (Poli Dabba)', size: 'Plastic', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
  { id: 'p-618', name: 'Dhokala Bhandi', size: 'Regular', productType: 'Gift', price: 0, costPrice: 0, stock: 0, category: 'Gift' },
];

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'SG Retail store',
    password: 'SGDB@11',
    database: 'SGDB',
  });

  for (const p of products) {
    const sql = 'INSERT INTO products (id, name, size, productType, price, costPrice, stock, category, isDeleted, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW()) ON DUPLICATE KEY UPDATE productType=VALUES(productType), price=VALUES(price), costPrice=VALUES(costPrice), stock=VALUES(stock)';
    const [r] = await pool.execute(sql, [p.id, p.name, p.size, p.productType, p.price, p.costPrice, p.stock, p.category]);
    console.log(p.name + ' (' + p.size + ') - ' + (r.affectedRows === 1 ? 'inserted' : 'updated'));
  }

  await pool.end();
  console.log('\n✅ Gift products inserted/updated');
})();
