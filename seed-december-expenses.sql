-- December 2025 Daily Expenses (Operational Costs)
-- Amounts are in Rupees in the data, converted to paise for database storage
-- Single INSERT statement with all expenses (unique IDs to avoid duplicates)

INSERT INTO expenses (id, type, amount, paymentMethod, description, date, items) VALUES
('exp-dec02-ops-001', 'operational_cost', 55000, 'cash', 'December 2 operational expense', '2025-12-02', NULL),
('exp-dec03-ops-001', 'operational_cost', 10000, 'cash', 'December 3 operational expense', '2025-12-03', NULL),
('exp-dec04-ops-001', 'operational_cost', 15000, 'cash', 'December 4 operational expense', '2025-12-04', NULL),
('exp-dec05-ops-001', 'operational_cost', 15000, 'cash', 'December 5 operational expense', '2025-12-05', NULL),
('exp-dec06-ops-001', 'operational_cost', 20000, 'cash', 'December 6 operational expense', '2025-12-06', NULL),
('exp-dec10-ops-001', 'operational_cost', 8000, 'cash', 'December 10 operational expense', '2025-12-10', NULL),
('exp-dec13-ops-001', 'operational_cost', 45000, 'cash', 'December 13 operational expense', '2025-12-13', NULL);
