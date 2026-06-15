-- Catálogo demo para supermercado (Nicaragua, C$)
-- Idempotente: solo inserta si las tablas están vacías.

INSERT IGNORE INTO tax_categories (id, name, percentage, is_active) VALUES
(1, 'IVA 15%', 15.00, 1),
(2, 'Exento',   0.00,  1);

INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Despensa',        'Productos básicos de consumo diario'),
(2, 'Lácteos',         'Leche, queso, mantequilla y derivados'),
(3, 'Granos y Cereales','Arroz, frijoles, harinas y pastas'),
(4, 'Bebidas',         'Refrescos, jugos y agua'),
(5, 'Limpieza',        'Artículos de aseo del hogar');

INSERT IGNORE INTO suppliers (id, company_name, contact_name, phone, email, address, created_at) VALUES
(1, 'Distribuidora La Unión S.A.', 'Carlos Méndez', '+505 2222-1100', 'ventas@launion.ni', 'Managua, Nicaragua', NOW()),
(2, 'Alimentos del Trópico',       'María González', '+505 8888-2200', 'compras@tropico.ni', 'León, Nicaragua', NOW());

INSERT IGNORE INTO products (id, barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id) VALUES
(1,  '7410000000219', 'Arroz Blanco Premium 1kg',             'Arroz de grano entero seleccionado',            0.9000, 1.3000, 230.0000, 20.0000, 1, NOW(), NOW(), 3, 1, 1),
(2,  '7410000000226', 'Frijoles Rojos Saborizados 800g',    'Frijoles listos para consumir o cocinar',       1.1000, 1.6500, 209.0000, 25.0000, 1, NOW(), NOW(), 3, 1, 1),
(3,  '7410000000233', 'Aceite Vegetal de Cocina 1L',        'Aceite refinado libre de colesterol',            1.9000, 2.7500, 176.0000, 15.0000, 1, NOW(), NOW(), 1, 1, 1),
(4,  '7410000000240', 'Azúcar Blanca Refinada 1kg',         'Azúcar alta pureza para endulzar',              0.7000, 1.0500, 399.0000, 30.0000, 1, NOW(), NOW(), 1, 1, 1),
(5,  '7410000000257', 'Sal Yodada de Mesa 500g',              'Sal fina para sazonar alimentos',               0.2500, 0.4500, 145.0000, 10.0000, 1, NOW(), NOW(), 1, 1, 1),
(6,  '7410000000264', 'Harina de Trigo Todo Uso 1kg',       'Harina refinada para panadería y repostería',   0.9000, 1.4000, 197.0000, 20.0000, 1, NOW(), NOW(), 3, 1, 1),
(7,  '7410000000271', 'Harina de Maíz Seleccionado 1kg',    'Harina para tortillas y arepas',                0.8000, 1.2000, 249.0000, 25.0000, 1, NOW(), NOW(), 3, 1, 1),
(8,  '7410000000288', 'Pasta Espagueti Pack 400g',          'Pasta de sémola de trigo duro',                 0.5000, 0.8500, 347.0000, 30.0000, 1, NOW(), NOW(), 3, 1, 1),
(9,  '7410000000295', 'Pasta Coditos Bolsa 400g',           'Pasta corta para ensaladas o sopas',            0.5000, 0.8500, 200.0000, 15.0000, 1, NOW(), NOW(), 3, 1, 1),
(10, '7410000000301', 'Leche Entera UHT 1L',                'Leche pasteurizada ultra higienizada',          1.2000, 1.7500, 120.0000, 15.0000, 1, NOW(), NOW(), 2, 2, 1),
(11, '7410000000318', 'Queso Crema 250g',                   'Queso crema para untar',                        1.5000, 2.2000,  85.0000, 10.0000, 1, NOW(), NOW(), 2, 2, 1),
(12, '7410000000325', 'Refresco Cola 2L',                   'Bebida gaseosa sabor cola',                     1.0000, 1.5000, 180.0000, 20.0000, 1, NOW(), NOW(), 4, 1, 1),
(13, '7410000000332', 'Agua Purificada 1.5L',               'Agua potable purificada',                       0.4000, 0.6500, 300.0000, 40.0000, 1, NOW(), NOW(), 4, 1, 1),
(14, '7410000000349', 'Detergente Líquido 1L',              'Detergente para ropa de color',               1.8000, 2.6000,  95.0000, 12.0000, 1, NOW(), NOW(), 5, 1, 1),
(15, '7410000000356', 'Salsa de Tomate 400g',               'Salsa de tomate natural',                       0.6000, 0.9500, 150.0000, 15.0000, 1, NOW(), NOW(), 1, 1, 1);

-- Lotes con fechas de vencimiento variadas (módulo PEPS / caducidad)
INSERT IGNORE INTO product_batches (id, batch_code, initial_quantity, current_quantity, entry_date, expiration_date, created_at, product_id) VALUES
(1,  'LOTE-ARROZ-001',  150.0000, 150.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY), NOW(), 1),
(2,  'LOTE-ARROZ-002',  80.0000,   80.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 25 DAY),  NOW(), 1),
(3,  'LOTE-FRIJ-001',   120.0000, 120.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY),  NOW(), 2),
(4,  'LOTE-ACEITE-001', 100.0000, 100.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY),   NOW(), 3),
(5,  'LOTE-LECHE-001',   60.0000,  60.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY),   NOW(), 10),
(6,  'LOTE-PASTA-001',  200.0000, 200.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY),  NOW(), 8);

INSERT IGNORE INTO customers (id, full_name, document_id, phone, email, address, created_at) VALUES
(1, 'Consumidor Final', NULL, NULL, NULL, NULL, NOW()),
(2, 'Juan Pérez López', '001-150890-0001A', '+505 8888-1234', 'juan.perez@email.com', 'Managua', NOW());
