-- Seed Expenses to PlanetScale
-- This file contains all December expenses that need to be seeded
-- Run each INSERT statement individually in PlanetScale console
-- Note: Amounts are in paise (100 paise = 1 rupee)

-- December 1-3 expenses
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec01-001', 'operational_cost', 50000, 'cash', 'December 1 expense', '2025-12-01', NULL);

INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec02-001', 'operational_cost', 60000, 'cash', 'December 2 expense', '2025-12-02', NULL);

INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec03-001', 'operational_cost', 55000, 'cash', 'December 3 expense', '2025-12-03', NULL);

-- December 10 expenses
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec10-001', 'operational_cost', 80000, 'cash', 'December 10 expense', '2025-12-10', NULL);

-- December 13 expenses  
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec13-001', 'operational_cost', 450000, 'cash', 'December 13 expense', '2025-12-13', NULL);

-- December 13 stock purchase (this is the missing one)
INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec13-002', 'stock_purchase', 1421000, 'cash', 'December 13 stock purchase', '2025-12-13', NULL);
