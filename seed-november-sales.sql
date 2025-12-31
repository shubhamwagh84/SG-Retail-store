-- Insert November 2025 sales data
-- Using sample product IDs - these will be created if they don't exist

-- 23 Nov 2025: 1000 cash
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov23-cash', 'p-101', 1, 100000, 'cash', '2025-11-23 10:00:00', 'November cash sale', NULL);

-- 24 Nov 2025: 400 cash, 230 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov24-cash', 'p-101', 1, 40000, 'cash', '2025-11-24 10:00:00', 'November cash sale', NULL),
('sale-nov24-qr', 'p-102', 1, 23000, 'qr_code', '2025-11-24 14:00:00', 'November QR sale', NULL);

-- 25 Nov 2025: 1500 cash, 950 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov25-cash', 'p-101', 1, 150000, 'cash', '2025-11-25 10:00:00', 'November cash sale', NULL),
('sale-nov25-qr', 'p-102', 1, 95000, 'qr_code', '2025-11-25 15:00:00', 'November QR sale', NULL);

-- 27 Nov 2025: 300 cash, 100 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov27-cash', 'p-103', 1, 30000, 'cash', '2025-11-27 10:00:00', 'November cash sale', NULL),
('sale-nov27-qr', 'p-101', 1, 10000, 'qr_code', '2025-11-27 16:00:00', 'November QR sale', NULL);

-- 28 Nov 2025: 1500 cash
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov28-cash', 'p-102', 1, 150000, 'cash', '2025-11-28 10:00:00', 'November cash sale', NULL);

-- 30 Nov 2025: 3300 cash, 530 QR
INSERT INTO sales (id, productId, qty, amount, paymentMethod, soldAt, note, user) VALUES
('sale-nov30-cash', 'p-101', 1, 330000, 'cash', '2025-11-30 10:00:00', 'November cash sale', NULL),
('sale-nov30-qr', 'p-103', 1, 53000, 'qr_code', '2025-11-30 17:00:00', 'November QR sale', NULL);
