-- Insert December 1-17, 2025 sales and expense data

-- 1 Dec 2025: 0 cash, 60 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec01-001', 'p-101', 1, 6000, 'qr_code', '2025-12-01 10:00:00', 'December 1 QR sale', NULL);

-- 2 Dec 2025: 3600 cash, 500 QR, 550 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec02-001', 'p-101', 36, 360000, 'cash', '2025-12-02 10:00:00', 'December 2 cash sale', NULL),
('sale-dec02-002', 'p-102', 5, 50000, 'qr_code', '2025-12-02 14:00:00', 'December 2 QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec02-001', 'operational_cost', 55000, 'cash', 'December 2 expense', '2025-12-02');

-- 3 Dec 2025: 1770 cash, 0 QR, 100 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec03-001', 'p-101', 18, 177000, 'cash', '2025-12-03 10:00:00', 'December 3 cash sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec03-001', 'operational_cost', 10000, 'cash', 'December 3 expense', '2025-12-03');

-- 4 Dec 2025: 900 cash, 600 QR, 150 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec04-001', 'p-101', 9, 90000, 'cash', '2025-12-04 10:00:00', 'December 4 cash sale', NULL),
('sale-dec04-002', 'p-102', 6, 60000, 'qr_code', '2025-12-04 14:00:00', 'December 4 QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec04-001', 'operational_cost', 15000, 'cash', 'December 4 expense', '2025-12-04');

-- 5 Dec 2025: 1650 cash, 0 QR, 150 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec05-001', 'p-101', 16, 165000, 'cash', '2025-12-05 10:00:00', 'December 5 cash sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec05-001', 'operational_cost', 15000, 'cash', 'December 5 expense', '2025-12-05');

-- 6 Dec 2025: 2600 cash, 320 QR, 200 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec06-001', 'p-101', 26, 260000, 'cash', '2025-12-06 10:00:00', 'December 6 cash sale', NULL),
('sale-dec06-002', 'p-102', 3, 32000, 'qr_code', '2025-12-06 14:00:00', 'December 6 QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec06-001', 'operational_cost', 20000, 'cash', 'December 6 expense', '2025-12-06');

-- 7-9 Dec 2025: No sales

-- 10 Dec 2025: 390 cash, 0 QR, 80 expense
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec10-001', 'p-101', 4, 39000, 'cash', '2025-12-10 10:00:00', 'December 10 cash sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec10-001', 'operational_cost', 8000, 'cash', 'December 10 expense', '2025-12-10');

-- 11 Dec 2025: 220 cash, 325 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec11-001', 'p-101', 2, 22000, 'cash', '2025-12-11 10:00:00', 'December 11 cash sale', NULL),
('sale-dec11-002', 'p-102', 3, 32500, 'qr_code', '2025-12-11 14:00:00', 'December 11 QR sale', NULL);

-- 12 Dec 2025: No sales

-- 13 Dec 2025: 1400 cash, 1040 QR, 450 expense, 14210 stock purchase
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec13-001', 'p-101', 14, 140000, 'cash', '2025-12-13 10:00:00', 'December 13 cash sale', NULL),
('sale-dec13-002', 'p-102', 10, 104000, 'qr_code', '2025-12-13 14:00:00', 'December 13 QR sale', NULL);
INSERT INTO expenses (id, type, amount, paymentMethod, description, date) VALUES
('exp-dec13-001', 'operational_cost', 45000, 'cash', 'December 13 expense', '2025-12-13'),
('exp-dec13-002', 'stock_purchase', 1421000, 'cash', 'December 13 stock purchase', '2025-12-13');

-- 14 Dec 2025: No sales

-- 15 Dec 2025: 0 cash, 3500 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-dec15-001', 'p-102', 35, 350000, 'qr_code', '2025-12-15 14:00:00', 'December 15 QR sale', NULL);

-- 16-17 Dec 2025: No sales
