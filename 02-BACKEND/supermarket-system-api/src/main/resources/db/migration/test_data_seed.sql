-- ============================================================
-- test_data_seed.sql
-- Datos de prueba – Supermercado ERP
-- Incluye: categorías, marcas, proveedores, impuestos y
-- productos con códigos PLU / cortos (frutas, verduras, abarrotes)
-- ============================================================
-- INSTRUCCIONES:
--   Ejecutar DESPUÉS de que Flyway haya aplicado todas las
--   migraciones (V1 … Vxx). Si ya hay datos, ajustar o
--   usar INSERT IGNORE / ON DUPLICATE KEY UPDATE.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORÍAS DE IMPUESTO
-- ─────────────────────────────────────────────────────────────
INSERT INTO tax_categories (name, percentage, is_active) VALUES
  ('Exento',       0.00,  TRUE),   -- id 1 – frutas/verduras
  ('IVA 12%',     12.00,  TRUE),   -- id 2 – abarrotes
  ('IVA 15%',     15.00,  TRUE),   -- id 3 – bebidas alcohólicas
  ('IVA 8%',       8.00,  TRUE)    -- id 4 – lácteos / especiales
ON DUPLICATE KEY UPDATE percentage = VALUES(percentage);

-- ─────────────────────────────────────────────────────────────
-- 2. CATEGORÍAS DE PRODUCTO
-- ─────────────────────────────────────────────────────────────
INSERT INTO categories (name, description) VALUES
  ('Frutas',                'Frutas frescas de temporada y tropicales'),
  ('Verduras y Hortalizas', 'Verduras, hortalizas y tubérculos frescos'),
  ('Lácteos',               'Leche, queso, yogur y derivados'),
  ('Carnicería',            'Carnes rojas, aves y embutidos'),
  ('Panadería',             'Pan, tortillas y repostería'),
  ('Abarrotes Secos',       'Granos, harinas, pastas, enlatados'),
  ('Bebidas',               'Jugos, refrescos y agua'),
  ('Higiene Personal',      'Jabones, shampoo, cuidado personal'),
  ('Limpieza del Hogar',    'Detergentes, desinfectantes y limpiadores'),
  ('Snacks y Golosinas',    'Galletas, dulces, frituras')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ─────────────────────────────────────────────────────────────
-- 3. MARCAS  (requiere tabla brands creada en V29)
-- ─────────────────────────────────────────────────────────────
INSERT INTO brands (name, description, is_active, created_at) VALUES
  ('Sin Marca',     'Productos a granel o sin marca comercial',    TRUE, NOW()),
  ('Nestlé',        'Alimentos y bebidas',                         TRUE, NOW()),
  ('Bimbo',         'Panificadora',                                TRUE, NOW()),
  ('Sigma',         'Embutidos y lácteos',                         TRUE, NOW()),
  ('La Costeña',    'Conservas y enlatados',                       TRUE, NOW()),
  ('Coca-Cola',     'Bebidas carbonatadas',                        TRUE, NOW()),
  ('Pepsi',         'Bebidas carbonatadas',                        TRUE, NOW()),
  ('Procter & Gamble','Higiene y limpieza',                        TRUE, NOW()),
  ('Unilever',      'Higiene, alimentos y limpieza',               TRUE, NOW()),
  ('Del Monte',     'Frutas y verduras procesadas',                TRUE, NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ─────────────────────────────────────────────────────────────
-- 4. PROVEEDORES
-- ─────────────────────────────────────────────────────────────
INSERT INTO suppliers (company_name, contact_name, phone, email, address, created_at) VALUES
  ('Distribuidora Frutas del Campo S.A.',    'Carlos Mendoza',   '5512345678', 'frutas@campo.com',      'Mercado Central, Bodega 4',         NOW()),
  ('Verduras Frescas del Valle Ltda.',       'María González',   '5523456789', 'ventas@frescasvalle.mx','Km 12 Carretera al Valle',           NOW()),
  ('Lácteos y Derivados San Luis S.A.',      'Juan Pérez',       '5534567890', 'pedidos@sanluis.mx',    'Zona Industrial Norte, Nave 8',      NOW()),
  ('Carnicería El Rancho Mayor',             'Roberto Flores',   '5545678901', 'rancho@mayor.mx',       'Av. Ganaderos 234',                  NOW()),
  ('Distribuidora de Abarrotes Nacional',    'Sofía Ramírez',    '5556789012', 'ventas@abarrotnac.mx',  'Parque Industrial Sur, Blvd. 12',    NOW()),
  ('Bebidas y Refrescos Centroamérica',      'Luis Herrera',     '5567890123', 'pedidos@brcam.mx',      'Calle Comercial 56, Bodega A',       NOW()),
  ('Higiene Total Distribuciones',           'Andrea Soto',      '5578901234', 'higiene@total.mx',      'Zona Franca, Local 22',              NOW()),
  ('Panadería y Tortillería La Espiga',      'Pedro Castillo',   '5589012345', 'laespiga@pan.mx',       'Barrio El Centro, Calle 3',          NOW())
ON DUPLICATE KEY UPDATE contact_name = VALUES(contact_name);

-- ─────────────────────────────────────────────────────────────
-- 5. PRODUCTOS
-- ─────────────────────────────────────────────────────────────
-- Convención de códigos PLU (cortos) para frutas y verduras:
--   4011 = Banana/Plátano (estándar internacional PLU)
--   4065 = Mango
--   4196 = Piña
--   4053 = Limón amarillo
--   4056 = Naranja
--   3045 = Manzana Roja
--   4409 = Papaya
--   4133 = Sandía
--   4682 = Fresa
--   4959 = Aguacate
--   3085 = Papa blanca
--   3124 = Tomate bola
--   3045 = Cebolla blanca
--   4663 = Chile verde
--   4543 = Zanahoria
--   3082 = Ajo
--   4588 = Brócoli
--   4929 = Lechuga
--   4384 = Pepino
--   4562 = Chayote
-- ─────────────────────────────────────────────────────────────

-- ═══ 5A. FRUTAS (PLU cortos, proveedor 1, categoría 1, impuesto exento) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('4011',  'Plátano / Banana',    'Plátano Cavendish maduro, precio por kg',     8.00,  12.50,  250.00, 20.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4065',  'Mango Ataulfo',       'Mango Ataulfo fresco, precio por kg',          10.00, 18.00,  180.00, 15.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4196',  'Piña',                'Piña golden fresca, precio por pieza',         15.00, 25.00,   80.00, 10.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4053',  'Limón',               'Limón amarillo, precio por kg',                 6.00,  9.50,  200.00, 20.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4056',  'Naranja Valencia',    'Naranja Valencia jugosa, precio por kg',        7.00, 11.00,  220.00, 25.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('3045',  'Manzana Roja',        'Manzana Red Delicious importada, por kg',      22.00, 35.00,  120.00, 15.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4409',  'Papaya',              'Papaya maradol, precio por pieza',             12.00, 20.00,   60.00,  8.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4133',  'Sandía',              'Sandía sin semilla, precio por kg',             5.00,  9.00,  300.00, 20.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4682',  'Fresa',               'Fresa fresca en charola 500g',                18.00, 28.00,   90.00, 10.00, TRUE, NOW(), NOW(), 1, 1, 1),
  ('4959',  'Aguacate Hass',       'Aguacate Hass mexicano, precio por kg',       35.00, 55.00,  140.00, 15.00, TRUE, NOW(), NOW(), 1, 1, 1)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5B. VERDURAS Y HORTALIZAS (PLU cortos, proveedor 2, categoría 2, exento) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('3085',  'Papa Blanca',         'Papa blanca a granel, precio por kg',           6.00,  9.50,  400.00, 30.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('3124',  'Tomate Bola',         'Tomate bola rojo, precio por kg',               8.00, 13.00,  300.00, 25.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('3046',  'Cebolla Blanca',      'Cebolla blanca a granel, precio por kg',        7.00, 11.00,  250.00, 20.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4663',  'Chile Verde Serrano', 'Chile serrano fresco, precio por kg',           10.00, 18.00,  150.00, 15.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4543',  'Zanahoria',           'Zanahoria fresca con cáscara, por kg',          5.50,  8.50,  280.00, 20.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('3082',  'Ajo',                 'Ajo blanco a granel, precio por 100g',          9.00, 15.00,  100.00, 10.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4588',  'Brócoli',             'Brócoli fresco por pieza (aprox 600g)',         12.00, 19.00,   80.00,  8.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4929',  'Lechuga Romana',      'Lechuga romana entera, por pieza',              7.00, 12.00,  120.00, 10.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4384',  'Pepino',              'Pepino fresco a granel, precio por kg',          5.00,  8.00,  200.00, 15.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4562',  'Chayote',             'Chayote liso fresco, precio por pieza',          4.00,  6.50,  180.00, 15.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4121',  'Espinaca',            'Espinaca fresca en manojo',                      8.00, 13.00,   90.00,  8.00, TRUE, NOW(), NOW(), 2, 2, 1),
  ('4401',  'Calabacita',          'Calabacita italiana fresca, por kg',             6.00, 10.00,  160.00, 12.00, TRUE, NOW(), NOW(), 2, 2, 1)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5C. LÁCTEOS (código EAN-13, proveedor 3, categoría 3, IVA 8%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('7501055300439', 'Leche Entera Lala 1L',     'Leche entera pasteurizada 1 litro',         16.00, 22.50,  200.00, 30.00, TRUE, NOW(), NOW(), 3, 3, 4),
  ('7501055362048', 'Yogurt Natural Lala 1kg',   'Yogurt natural sin azúcar 1kg',             24.00, 35.00,   80.00, 15.00, TRUE, NOW(), NOW(), 3, 3, 4),
  ('7506306700022', 'Crema Ácida Sigma 400g',    'Crema ácida espesa 400g',                   18.00, 26.00,   70.00, 12.00, TRUE, NOW(), NOW(), 3, 3, 4),
  ('7506455020013', 'Queso Panela 400g',         'Queso panela fresco 400g',                  28.00, 42.00,   60.00, 10.00, TRUE, NOW(), NOW(), 3, 3, 4),
  ('7501003483222', 'Mantequilla Lala 90g',      'Mantequilla sin sal en barra 90g',          12.00, 19.00,   90.00, 15.00, TRUE, NOW(), NOW(), 3, 3, 4)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5D. ABARROTES SECOS (EAN-13, proveedor 5, categoría 6, IVA 12%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('7501003494601', 'Arroz Morelos 1kg',         'Arroz de grano largo precocido 1kg',        14.00, 21.00,  500.00, 50.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501025400016', 'Frijol Negro 1kg',           'Frijol negro seleccionado 1kg',             16.00, 24.00,  400.00, 40.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501555403125', 'Aceite Vegetal 946ml',       'Aceite vegetal para cocinar 946ml',         28.00, 42.00,  150.00, 20.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501015903018', 'Harina de Trigo 1kg',        'Harina de trigo todo uso 1kg',              11.00, 18.00,  200.00, 25.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501023200101', 'Azúcar Estándar 1kg',        'Azúcar refinada 1kg',                        9.00, 14.50,  350.00, 40.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7750095001010', 'Sal de Mesa 1kg',            'Sal yodada fina 1kg',                        5.00,  8.00,  300.00, 30.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501017830226', 'Pasta Espagueti 500g',       'Pasta de trigo duro tipo spaghetti 500g',  10.00, 16.00,  220.00, 25.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7750095551036', 'Atún en agua 140g',          'Atún en agua con sal 140g',                 10.00, 16.50,  300.00, 30.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501040209301', 'Frijoles La Costeña 560g',  'Frijoles refritos en lata 560g',            14.00, 22.00,  180.00, 20.00, TRUE, NOW(), NOW(), 6, 5, 2),
  ('7501048002062', 'Chiles Chipotles 220g',      'Chiles chipotles adobados en lata 220g',   12.00, 20.00,  120.00, 15.00, TRUE, NOW(), NOW(), 6, 5, 2)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5E. BEBIDAS (EAN-13, proveedor 6, categoría 7, IVA 12%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('7501055904044', 'Coca-Cola 600ml',            'Refresco de cola 600ml PET',                 9.00, 15.00,  300.00, 40.00, TRUE, NOW(), NOW(), 7, 6, 2),
  ('7501055904051', 'Coca-Cola 2L',               'Refresco de cola 2 litros PET',             16.00, 25.00,  200.00, 30.00, TRUE, NOW(), NOW(), 7, 6, 2),
  ('7501000823065', 'Pepsi 600ml',                'Refresco de cola Pepsi 600ml PET',           9.00, 15.00,  250.00, 35.00, TRUE, NOW(), NOW(), 7, 6, 2),
  ('7500628022099', 'Agua Ciel 600ml',            'Agua purificada sin gas 600ml',              4.50,  8.00,  400.00, 50.00, TRUE, NOW(), NOW(), 7, 6, 2),
  ('7500628022204', 'Agua Ciel 1.5L',             'Agua purificada sin gas 1.5 litros',         7.00, 13.00,  300.00, 40.00, TRUE, NOW(), NOW(), 7, 6, 2),
  ('7501032901048', 'Jugo del Valle Naranja 1L',  'Néctar de naranja 1 litro Tetra Pak',       18.00, 27.00,  150.00, 20.00, TRUE, NOW(), NOW(), 7, 6, 2)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5F. PANADERÍA (código corto, proveedor 8, categoría 5, IVA 12%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('PAN01', 'Pan Blanco Grande',    'Pan blanco de caja familiar, por pieza',      14.00, 22.00,   50.00,  8.00, TRUE, NOW(), NOW(), 5, 8, 2),
  ('PAN02', 'Tortilla de Maíz 1kg', 'Tortillas de maíz artesanales 1kg',           10.00, 16.00,  100.00, 15.00, TRUE, NOW(), NOW(), 5, 8, 2),
  ('PAN03', 'Bolillo',              'Bolillo esponjoso por pieza',                   2.00,  3.50,  200.00, 20.00, TRUE, NOW(), NOW(), 5, 8, 2),
  ('PAN04', 'Pan Dulce Concha',     'Concha tradicional de vainilla o chocolate',    3.50,  6.00,  120.00, 15.00, TRUE, NOW(), NOW(), 5, 8, 2)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5G. HIGIENE PERSONAL (EAN-13, proveedor 7, categoría 8, IVA 12%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('7501076605051', 'Shampoo Dove 400ml',           'Shampoo hidratante Dove 400ml',            45.00, 68.00,   80.00, 10.00, TRUE, NOW(), NOW(), 8, 7, 2),
  ('7501076602746', 'Jabón Dove 90g x3',            'Jabón barra Dove pack x3 unidades',        38.00, 58.00,   90.00, 12.00, TRUE, NOW(), NOW(), 8, 7, 2),
  ('7501006567209', 'Pasta Dental Colgate 100ml',   'Pasta dental con flúor 100ml',             22.00, 34.00,  120.00, 15.00, TRUE, NOW(), NOW(), 8, 7, 2),
  ('7501007602102', 'Desodorante Axe 97g',           'Desodorante antitranspirante en aerosol',  38.00, 58.00,   70.00, 10.00, TRUE, NOW(), NOW(), 8, 7, 2)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5H. LIMPIEZA DEL HOGAR (EAN-13, proveedor 7, categoría 9, IVA 12%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('7501003131401', 'Detergente Ariel 1kg',         'Detergente en polvo Ariel 1kg',            52.00, 79.00,   60.00,  8.00, TRUE, NOW(), NOW(), 9, 7, 2),
  ('7501007102014', 'Pinol Desinfectante 828ml',    'Limpiador desinfectante Pinol 828ml',      28.00, 44.00,   80.00, 10.00, TRUE, NOW(), NOW(), 9, 7, 2),
  ('7500478000144', 'Cloro Cloralex 930ml',          'Blanqueador con cloro 930ml',              14.00, 22.00,  100.00, 15.00, TRUE, NOW(), NOW(), 9, 7, 2),
  ('7501010600147', 'Esponja Scotch-Brite Verde',   'Esponja de fibra para trastes x2',          8.00, 14.00,  150.00, 20.00, TRUE, NOW(), NOW(), 9, 7, 2)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ═══ 5I. SNACKS Y GOLOSINAS (EAN-13, proveedor 5, categoría 10, IVA 12%) ═══
INSERT INTO products (barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id)
VALUES
  ('7501010410010', 'Sabritas Clásicas 45g',        'Papas fritas con sal 45g',                  9.00, 16.00,  200.00, 25.00, TRUE, NOW(), NOW(), 10, 5, 2),
  ('7503006541028', 'Doritos Nacho 62g',             'Totopos con queso nacho 62g',               11.00, 18.00,  180.00, 25.00, TRUE, NOW(), NOW(), 10, 5, 2),
  ('7501000823300', 'Galleta María Gamesa 400g',     'Galletas de vainilla tipo María 400g',      16.00, 25.00,  150.00, 20.00, TRUE, NOW(), NOW(), 10, 5, 2),
  ('7501021900012', 'Chocolate Carlos V 18g',        'Chocolate con leche en barrita',             4.00,  7.00,  300.00, 30.00, TRUE, NOW(), NOW(), 10, 5, 2),
  ('7501028900207', 'Paletas Payaso x6',             'Paletas de dulce surtido x6',                9.00, 15.00,  200.00, 20.00, TRUE, NOW(), NOW(), 10, 5, 2)
ON DUPLICATE KEY UPDATE sale_price = VALUES(sale_price), current_stock = VALUES(current_stock);

-- ─────────────────────────────────────────────────────────────
-- 6. LOTES DE VENCIMIENTO para productos perecederos clave
-- ─────────────────────────────────────────────────────────────
-- Nota: product_id obtenido por barcode para mayor portabilidad
INSERT INTO product_batches (batch_code, initial_quantity, current_quantity, entry_date, expiration_date, created_at, product_id)
SELECT CONCAT('L-', p.barcode, '-01'), 100.00, 100.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), NOW(), p.id
FROM products p
WHERE p.barcode IN ('4011','4065','4196','4056','3045','4959','4682')
ON DUPLICATE KEY UPDATE current_quantity = VALUES(current_quantity);

INSERT INTO product_batches (batch_code, initial_quantity, current_quantity, entry_date, expiration_date, created_at, product_id)
SELECT CONCAT('L-', p.barcode, '-01'), 150.00, 150.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), NOW(), p.id
FROM products p
WHERE p.barcode IN ('3085','3124','3046','4543','4588','4929','4384','4121')
ON DUPLICATE KEY UPDATE current_quantity = VALUES(current_quantity);

INSERT INTO product_batches (batch_code, initial_quantity, current_quantity, entry_date, expiration_date, created_at, product_id)
SELECT CONCAT('L-', p.barcode, '-01'), 80.00, 80.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NOW(), p.id
FROM products p
WHERE p.barcode IN ('7501055300439','7501055362048','7506306700022','7506455020013')
ON DUPLICATE KEY UPDATE current_quantity = VALUES(current_quantity);

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
-- RESUMEN DE DATOS INSERTADOS
-- ─────────────────────────────────────────────────────────────
-- ✅ 4  categorías de impuesto (Exento, 8%, 12%, 15%)
-- ✅ 10 categorías de producto
-- ✅ 10 marcas comerciales
-- ✅  8 proveedores
-- ✅ 51 productos:
--      10 frutas  con PLU de 4 dígitos (estándar internacional)
--      12 verduras con PLU de 4 dígitos
--       5 lácteos con EAN-13
--      10 abarrotes secos con EAN-13
--       6 bebidas con EAN-13
--       4 panadería con código PAN0x (corto)
--       4 higiene personal con EAN-13
--       4 limpieza del hogar con EAN-13
--       5 snacks y golosinas con EAN-13
-- ✅ Lotes de vencimiento para productos perecederos
-- ─────────────────────────────────────────────────────────────
