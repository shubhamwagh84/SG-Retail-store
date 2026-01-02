-- Delete all sales data
DELETE FROM sales;

-- Insert November 23-30, 2025 sales data

-- 23 Nov 2025: 1000 cash
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov23-001', 'p-101', 10, 100000, 'cash', '2025-11-23 10:00:00', 'November 23 cash sale', NULL);

-- 24 Nov 2025: 400 cash, 230 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov24-001', 'p-101', 4, 40000, 'cash', '2025-11-24 10:00:00', 'November 24 cash sale', NULL),
('sale-nov24-002', 'p-102', 2, 23000, 'qr_code', '2025-11-24 14:00:00', 'November 24 QR sale', NULL);

-- 25 Nov 2025: 1500 cash, 950 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov25-001', 'p-101', 15, 150000, 'cash', '2025-11-25 10:00:00', 'November 25 cash sale', NULL),
('sale-nov25-002', 'p-102', 9, 95000, 'qr_code', '2025-11-25 15:00:00', 'November 25 QR sale', NULL);

-- 26 Nov 2025: No sales

-- 27 Nov 2025: 300 cash, 100 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov27-001', 'p-103', 3, 30000, 'cash', '2025-11-27 10:00:00', 'November 27 cash sale', NULL),
('sale-nov27-002', 'p-101', 1, 10000, 'qr_code', '2025-11-27 16:00:00', 'November 27 QR sale', NULL);

-- 28 Nov 2025: 1500 cash
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov28-001', 'p-102', 15, 150000, 'cash', '2025-11-28 10:00:00', 'November 28 cash sale', NULL);

-- 29 Nov 2025: No sales

-- 30 Nov 2025: 3300 cash, 530 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov30-001', 'p-101', 33, 330000, 'cash', '2025-11-30 10:00:00', 'November 30 cash sale', NULL),
('sale-nov30-002', 'p-103', 5, 53000, 'qr_code', '2025-11-30 17:00:00', 'November 30 QR sale', NULL);
