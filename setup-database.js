const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'SG Retail store',
      password: 'SGDB@11',
      database: 'SGDB',
    });

    console.log('✅ Connected to MySQL database\n');

    // Create products table
    console.log('📦 Creating products table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        variant VARCHAR(255),
        size VARCHAR(64),
        pattern VARCHAR(64),
        company VARCHAR(128),
        design VARCHAR(255),
        category VARCHAR(128) NOT NULL,
        price INT NOT NULL DEFAULT 0,
        costPrice INT NOT NULL DEFAULT 0,
        stock INT NOT NULL DEFAULT 0,
        stockAlwaysNeeded TINYINT(1) DEFAULT 0,
        avgStockNeeded INT,
        reorderStatus VARCHAR(64),
        notes TEXT,
        photoUrl TEXT,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        isDeleted TINYINT(1) DEFAULT 0
      )
    `);
    console.log('   ✅ Products table created');

    // Create sales table
    console.log('💰 Creating sales table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(64) PRIMARY KEY,
        productId VARCHAR(64),
        qty INT NOT NULL,
        amount INT NOT NULL,
        paymentMethod VARCHAR(32),
        soldAt DATETIME NOT NULL,
        note TEXT,
        user VARCHAR(128),
        FOREIGN KEY (productId) REFERENCES products(id)
      )
    `);
    console.log('   ✅ Sales table created');

    // Create expenses table
    console.log('💸 Creating expenses table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(64) NOT NULL,
        amount INT NOT NULL,
        paymentMethod VARCHAR(32),
        description TEXT,
        date DATE NOT NULL,
        items JSON
      )
    `);
    console.log('   ✅ Expenses table created');

    console.log('\n📥 Inserting data...\n');

    // Insert products
    const products = [
      { id: 'p-101', name: 'Stainless Saucepan 2L', category: 'Cookware', price: 120000, costPrice: 80000, stock: 50 },
      { id: 'p-102', name: 'Cast Iron Tawa', category: 'Cookware', price: 95000, costPrice: 65000, stock: 30 },
      { id: 'p-103', name: 'Copper Bottle 1L', category: 'Bottles', price: 45000, costPrice: 30000, stock: 40 },
    ];

    for (const p of products) {
      await connection.query(
        `INSERT INTO products (id, name, category, price, costPrice, stock, stockAlwaysNeeded, avgStockNeeded, reorderStatus, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, 1, 20, 'ok', NOW())`,
        [p.id, p.name, p.category, p.price, p.costPrice, p.stock]
      );
    }
    console.log('   ✅ Inserted 3 products');

    // Insert November sales
    const sales = [
      { date: '2025-11-23', cash: 100000, qr: 0 },
      { date: '2025-11-24', cash: 40000, qr: 23000 },
      { date: '2025-11-25', cash: 150000, qr: 95000 },
      { date: '2025-11-27', cash: 30000, qr: 10000 },
      { date: '2025-11-28', cash: 150000, qr: 0 },
      { date: '2025-11-30', cash: 330000, qr: 53000 },
    ];

    let saleCount = 0;
    for (const day of sales) {
      if (day.cash > 0) {
        await connection.query(
          `INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note) 
           VALUES (?, ?, 1, ?, 'cash', ?, ?)`,
          [`sale-${day.date}-cash`, 'p-101', day.cash, `${day.date} 10:00:00`, `Cash sale for ${day.date}`]
        );
        saleCount++;
      }
      if (day.qr > 0) {
        await connection.query(
          `INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note) 
           VALUES (?, ?, 1, ?, 'qr_code', ?, ?)`,
          [`sale-${day.date}-qr`, 'p-102', day.qr, `${day.date} 14:00:00`, `QR sale for ${day.date}`]
        );
        saleCount++;
      }
    }
    console.log(`   ✅ Inserted ${saleCount} sales records`);

    console.log('\n✅ Database setup complete!\n');

    // Verify
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [salesCount] = await connection.query('SELECT COUNT(*) as count FROM sales');
    console.log('📊 Verification:');
    console.log(`   Products: ${productCount[0].count}`);
    console.log(`   Sales: ${salesCount[0].count}`);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
