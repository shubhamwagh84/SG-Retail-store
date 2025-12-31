-- December 2025 sales and expenses data

-- 1 Dec 2025: 60 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec01-qr', 'p-101', 1, 6000, 'qr_code', '2025-12-01 10:00:00', 'December QR sale', NULL);

-- 2 Dec 2025: 3600 cash, 500 QR, 550 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec02-cash', 'p-101', 1, 360000, 'cash', '2025-12-02 10:00:00', 'December cash sale', NULL),
('sale-dec02-qr', 'p-102', 1, 50000, 'qr_code', '2025-12-02 14:00:00', 'December QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec02', 'operational_cost', 55000, 'cash', 'December expense', '2025-12-02', NULL);

-- 3 Dec 2025: 1770 cash, 100 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec03-cash', 'p-102', 1, 177000, 'cash', '2025-12-03 10:00:00', 'December cash sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec03', 'operational_cost', 10000, 'cash', 'December expense', '2025-12-03', NULL);

-- 4 Dec 2025: 900 cash, 600 QR, 150 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec04-cash', 'p-103', 1, 90000, 'cash', '2025-12-04 10:00:00', 'December cash sale', NULL),
('sale-dec04-qr', 'p-101', 1, 60000, 'qr_code', '2025-12-04 15:00:00', 'December QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec04', 'operational_cost', 15000, 'cash', 'December expense', '2025-12-04', NULL);

-- 5 Dec 2025: 1650 cash, 150 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec05-cash', 'p-102', 1, 165000, 'cash', '2025-12-05 10:00:00', 'December cash sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec05', 'operational_cost', 15000, 'cash', 'December expense', '2025-12-05', NULL);

-- 6 Dec 2025: 2600 cash, 320 QR, 200 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec06-cash', 'p-103', 1, 260000, 'cash', '2025-12-06 10:00:00', 'December cash sale', NULL),
('sale-dec06-qr', 'p-101', 1, 32000, 'qr_code', '2025-12-06 16:00:00', 'December QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec06', 'operational_cost', 20000, 'cash', 'December expense', '2025-12-06', NULL);

-- 10 Dec 2025: 390 cash, 80 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec10-cash', 'p-102', 1, 39000, 'cash', '2025-12-10 10:00:00', 'December cash sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec10', 'operational_cost', 8000, 'cash', 'December expense', '2025-12-10', NULL);

-- 11 Dec 2025: 220 cash, 325 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec11-cash', 'p-101', 1, 22000, 'cash', '2025-12-11 10:00:00', 'December cash sale', NULL),
('sale-dec11-qr', 'p-103', 1, 32500, 'qr_code', '2025-12-11 14:00:00', 'December QR sale', NULL);

-- 13 Dec 2025: 1400 cash, 1040 QR, 450 expense, 14210 stock purchase
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec13-cash', 'p-102', 1, 140000, 'cash', '2025-12-13 10:00:00', 'December cash sale', NULL),
('sale-dec13-qr', 'p-103', 1, 104000, 'qr_code', '2025-12-13 15:00:00', 'December QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec13', 'operational_cost', 45000, 'cash', 'December expense', '2025-12-13', NULL),
('exp-dec13-stock', 'stock_purchase', 1421000, 'cash', 'December stock purchase', '2025-12-13', '[{"productId":"p-101","qty":10},{"productId":"p-102","qty":8}]');

-- 15 Dec 2025: 3500 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec15-qr', 'p-101', 1, 350000, 'qr_code', '2025-12-15 10:00:00', 'December QR sale', NULL);
