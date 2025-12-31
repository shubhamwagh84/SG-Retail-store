const mysql = require('mysql2/promise');

const products = [
  {id: 'p-501', name: 'Samai', size: '12 No', productType: 'Tamba pital', price: 199, costPrice: 100, stock: 80, category: 'Pooja'},
  {id: 'p-502', name: 'Samai', size: 'Choti size', productType: 'Tamba pital', price: 149, costPrice: 75, stock: 90, category: 'Pooja'},
  {id: 'p-503', name: 'Samai', size: 'Mothi size', productType: 'Tamba pital', price: 249, costPrice: 125, stock: 70, category: 'Pooja'},
  {id: 'p-504', name: 'Puja thali 4 no', size: 'Regular', productType: 'Tamba pital', price: 129, costPrice: 65, stock: 100, category: 'Pooja'},
  {id: 'p-505', name: 'Tamba Glass', size: 'Regular - Bhari madhele', productType: 'Tamba pital', price: 99, costPrice: 50, stock: 120, category: 'Pooja'},
  {id: 'p-506', name: 'Pital Tope', size: '10*14', productType: 'Tamba pital', price: 399, costPrice: 200, stock: 40, category: 'Pooja'},
  {id: 'p-507', name: 'Tamba Matka', size: '2 No', productType: 'Tamba pital', price: 189, costPrice: 95, stock: 60, category: 'Pooja'},
  {id: 'p-508', name: 'Tamba Matka', size: '3 No', productType: 'Tamba pital', price: 219, costPrice: 110, stock: 60, category: 'Pooja'},
  {id: 'p-509', name: 'Tamba Handa - Handi type', size: 'Regular', productType: 'Tamba pital', price: 169, costPrice: 85, stock: 70, category: 'Pooja'},
  {id: 'p-510', name: 'Tamba Kalshi - Handi type', size: 'Regular', productType: 'Tamba pital', price: 179, costPrice: 90, stock: 70, category: 'Pooja'},
  {id: 'p-511', name: 'Soyra Pital', size: 'Regular', productType: 'Tamba pital', price: 159, costPrice: 80, stock: 80, category: 'Pooja'},
  {id: 'p-512', name: 'Tamba Taat - Devach', size: '7 No', productType: 'Tamba pital', price: 119, costPrice: 60, stock: 90, category: 'Pooja'},
  {id: 'p-513', name: 'Tamba Taat - Devach', size: '9 No', productType: 'Tamba pital', price: 129, costPrice: 65, stock: 90, category: 'Pooja'},
  {id: 'p-514', name: 'Tamba Taat - Devach', size: '13 No', productType: 'Tamba pital', price: 149, costPrice: 75, stock: 80, category: 'Pooja'},
  {id: 'p-515', name: 'Tamba Taat - Devach', size: '14 No', productType: 'Tamba pital', price: 159, costPrice: 80, stock: 80, category: 'Pooja'},
  {id: 'p-516', name: 'Tamba Taat - Devach', size: '15 No', productType: 'Tamba pital', price: 169, costPrice: 85, stock: 80, category: 'Pooja'},
  {id: 'p-517', name: 'Tamba', size: '8 No', productType: 'Tamba pital', price: 99, costPrice: 50, stock: 100, category: 'Pooja'},
  {id: 'p-518', name: 'Tamba', size: '8 No - Bhari madhele', productType: 'Tamba pital', price: 119, costPrice: 60, stock: 90, category: 'Pooja'},
  {id: 'p-519', name: 'Tamba', size: '10 No - Bhari madhele', productType: 'Tamba pital', price: 139, costPrice: 70, stock: 90, category: 'Pooja'},
  {id: 'p-520', name: 'Tamba', size: '12 No - Bhari madhele', productType: 'Tamba pital', price: 159, costPrice: 80, stock: 90, category: 'Pooja'},
  {id: 'p-521', name: 'Ganpati', size: 'Small Size', productType: 'Tamba pital', price: 129, costPrice: 65, stock: 70, category: 'Pooja'},
  {id: 'p-522', name: 'Ganpati', size: 'Big Size', productType: 'Tamba pital', price: 199, costPrice: 100, stock: 60, category: 'Pooja'},
  {id: 'p-523', name: 'Rangnath', size: 'Small Size', productType: 'Tamba pital', price: 129, costPrice: 65, stock: 70, category: 'Pooja'},
  {id: 'p-524', name: 'Rangnath', size: 'Big Size', productType: 'Tamba pital', price: 199, costPrice: 100, stock: 60, category: 'Pooja'},
  {id: 'p-525', name: 'Annapura', size: 'Small Size', productType: 'Tamba pital', price: 129, costPrice: 65, stock: 70, category: 'Pooja'},
  {id: 'p-526', name: 'Annapura', size: 'Big Size', productType: 'Tamba pital', price: 199, costPrice: 100, stock: 60, category: 'Pooja'},
  {id: 'p-527', name: 'Pital Ghanti', size: 'Small size', productType: 'Tamba pital', price: 99, costPrice: 50, stock: 90, category: 'Pooja'},
  {id: 'p-528', name: 'Pital Ghanti', size: 'mid size', productType: 'Tamba pital', price: 119, costPrice: 60, stock: 90, category: 'Pooja'},
  {id: 'p-529', name: 'Pital Ghanti', size: 'Big Size', productType: 'Tamba pital', price: 149, costPrice: 75, stock: 80, category: 'Pooja'},
  {id: 'p-530', name: 'Tamba Glass', size: 'Regular size', productType: 'Tamba pital', price: 99, costPrice: 50, stock: 120, category: 'Pooja'},
  {id: 'p-531', name: 'Ghaghal', size: 'Big Size', productType: 'Tamba pital', price: 189, costPrice: 95, stock: 70, category: 'Pooja'},
  {id: 'p-532', name: 'Ghaghal', size: 'Small Size', productType: 'Tamba pital', price: 149, costPrice: 75, stock: 80, category: 'Pooja'},
  {id: 'p-533', name: 'Jali Diwa', size: 'Small Size', productType: 'Tamba pital', price: 119, costPrice: 60, stock: 90, category: 'Pooja'},
  {id: 'p-534', name: 'Kapur aarti', size: 'Big Size', productType: 'Tamba pital', price: 159, costPrice: 80, stock: 80, category: 'Pooja'},
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
  console.log('\n✅ All Tamba Pital products inserted successfully!');
})();
