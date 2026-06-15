-- Migración V35: Poblado de Catálogo Comercial Real de Nicaragua (C$)
-- Este script limpia las tablas de negocio de forma segura y carga el catálogo completo

-- 1. Desactivar temporalmente la validación de claves externas
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Limpieza total de tablas de transacciones y negocio
TRUNCATE TABLE sale_payments;
TRUNCATE TABLE sale_details;
TRUNCATE TABLE sales;
TRUNCATE TABLE credit_note_details;
TRUNCATE TABLE credit_notes;
TRUNCATE TABLE customers;
TRUNCATE TABLE coupons;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE inventory_movements;
TRUNCATE TABLE product_batches;
TRUNCATE TABLE inventory_count_lines;
TRUNCATE TABLE inventory_count_sessions;
TRUNCATE TABLE daily_closures;
TRUNCATE TABLE product_uom_conversions;
TRUNCATE TABLE product_purchase_packs;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE brands;

-- 3. Insertar Categorías Reales
INSERT INTO categories (id, name, description) VALUES
(1, 'Despensa', 'Productos básicos de consumo y abarrotes diarios'),
(2, 'Lácteos y Huevos', 'Leches, quesos, cremas, huevos y derivados lacteos'),
(3, 'Granos Básicos', 'Arroz, frijoles, harinas, pastas y cereales esenciales'),
(4, 'Bebidas', 'Gaseosas, jugos, aguas, cervezas y licores nacionales'),
(5, 'Limpieza del Hogar', 'Detergentes, cloros, desinfectantes y artículos de aseo'),
(6, 'Cuidado Personal', 'Jabones, champús, cremas dentales, desodorantes y aseo personal'),
(7, 'Embutidos y Cárnicos', 'Jamones, salchichas, embutidos y carnes frescas'),
(8, 'Panadería y Repostería', 'Pan de molde, galletas, repostería y panes dulces'),
(9, 'Snacks y Golosinas', 'Platanitos, tortrix, papas fritas y dulces varios');

-- 4. Insertar Proveedores Locales de Nicaragua
INSERT INTO suppliers (id, company_name, contact_name, phone, email, address, created_at) VALUES
(1, 'Distribuidora César Guerrero S.A. (DICGSA)', 'Alvaro Callejas', '+505 2248-8900', 'ventas@dicgsa.com.ni', 'Carretera Norte Km 5.5, Managua', NOW()),
(2, 'Alimentos y Embutidos ICI S.A.', 'Ramiro Altamirano', '+505 2263-1200', 'pedidos@ici.com.ni', 'Carretera Vieja a León Km 9, Managua', NOW()),
(3, 'Centrolac Nicaragua', 'Ligia Castellón', '+505 2253-8000', 'ventas@centrolac.com.ni', 'Tipitapa, Managua', NOW()),
(4, 'Compañía Cervecera de Nicaragua (CCN)', 'Néstor Barberena', '+505 2249-1100', 'pedidos@ccn.com.ni', 'Carretera Norte Km 6, Managua', NOW()),
(5, 'Distribuidora La Unión S.A.', 'Giselle Fonseca', '+505 2222-1100', 'ventas@launion.ni', 'Carretera Masaya Km 4.5, Managua', NOW()),
(6, 'Bimbo de Nicaragua S.A.', 'Julio Oporta', '+505 2289-5400', 'servicio@bimbo.com.ni', 'Sabanagrande, Managua', NOW());

-- 5. Insertar 120 Productos Reales con Precios Reales en Córdobas (C$)
-- Los precios son estimaciones reales de supermercados de Nicaragua (Costo vs Venta)
INSERT INTO products (id, barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id) VALUES
-- CATEGORÍA 3: Granos Básicos (15 productos)
(1, '7411000000010', 'Arroz Faisán 80/20 1lb', 'Arroz blanco de grano entero seleccionado', 14.5000, 18.0000, 450.0000, 30.0000, 1, NOW(), NOW(), 3, 1, 2),
(2, '7411000000027', 'Arroz Faisán Dorado 96/4 1lb', 'Arroz super premium de alta calidad', 17.5000, 22.0000, 350.0000, 25.0000, 1, NOW(), NOW(), 3, 1, 2),
(3, '7411000000034', 'Arroz Faisán 80/20 5lb', 'Bolsa familiar de arroz blanco', 70.0000, 88.0000, 200.0000, 15.0000, 1, NOW(), NOW(), 3, 1, 2),
(4, '7411000000041', 'Frijol Rojo de Seda 1lb', 'Frijol rojo limpio seleccionado de primera calidad', 26.0000, 32.0000, 500.0000, 40.0000, 1, NOW(), NOW(), 3, 5, 2),
(5, '7411000000058', 'Frijol Negro Seleccionado 1lb', 'Frijol negro de grano mediano', 22.0000, 28.0000, 150.0000, 10.0000, 1, NOW(), NOW(), 3, 5, 2),
(6, '7411000000065', 'Azúcar Sulka Blanca 1kg', 'Azúcar refinada nicaragüense', 16.5000, 21.0000, 400.0000, 30.0000, 1, NOW(), NOW(), 3, 1, 2),
(7, '7411000000072', 'Azúcar Sulka Morena 1kg', 'Azúcar morena natural de caña', 15.0000, 19.5000, 250.0000, 20.0000, 1, NOW(), NOW(), 3, 1, 2),
(8, '7411000000089', 'Sal Yodada El Rey 500g', 'Sal fina de mesa yodada', 4.5000, 6.0000, 300.0000, 15.0000, 1, NOW(), NOW(), 3, 5, 2),
(9, '7411000000096', 'Harina de Trigo El Dorado 1kg', 'Harina de trigo de fuerza todo uso', 20.0000, 26.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 3, 1, 2),
(10, '7411000000102', 'Harina de Maíz Maseca 1kg', 'Harina de maíz nixtamalizado para tortillas', 22.5000, 28.0000, 400.0000, 35.0000, 1, NOW(), NOW(), 3, 1, 2),
(11, '7411000000119', 'Espaguetis Roma 400g', 'Pasta espagueti larga de sémola', 14.0000, 18.0000, 320.0000, 25.0000, 1, NOW(), NOW(), 3, 5, 2),
(12, '7411000000126', 'Coditos Roma 400g', 'Pasta de codito corta para ensalada', 14.0000, 18.0000, 280.0000, 20.0000, 1, NOW(), NOW(), 3, 5, 2),
(13, '7411000000133', 'Avena Quaker Integral 350g', 'Hojuelas de avena de grano entero', 28.0000, 36.0000, 140.0000, 10.0000, 1, NOW(), NOW(), 3, 5, 2),
(14, '7411000000140', 'Cereal Corn Flakes Kellogg\'s 350g', 'Cereal de hojuelas de maíz tostadas', 62.0000, 78.0000, 110.0000, 12.0000, 1, NOW(), NOW(), 3, 5, 1),
(15, '7411000000157', 'Cereal Choco Krispis 350g', 'Cereal de arroz inflado sabor chocolate', 65.0000, 82.0000, 95.0000, 10.0000, 1, NOW(), NOW(), 3, 5, 1),

-- CATEGORÍA 1: Despensa (20 productos)
(16, '7411000000164', 'Aceite Ideal Girasol 1L', 'Aceite de cocina refinado de girasol', 62.0000, 78.0000, 220.0000, 20.0000, 1, NOW(), NOW(), 1, 1, 1),
(17, '7411000000171', 'Aceite Corona Vegetal 1L', 'Aceite vegetal económico para freír', 48.0000, 60.0000, 280.0000, 25.0000, 1, NOW(), NOW(), 1, 1, 1),
(18, '7411000000188', 'Café Presto 150g', 'Café instantáneo nicaragüense puro', 52.0000, 68.0000, 200.0000, 15.0000, 1, NOW(), NOW(), 1, 5, 1),
(19, '7411000000195', 'Café Toro 200g Molido', 'Café tradicional molido sabor fuerte', 40.0000, 52.0000, 170.0000, 12.0000, 1, NOW(), NOW(), 1, 5, 1),
(20, '7411000000201', 'Salsa de Tomate Natura\'s 400g', 'Salsa de tomate condimentada', 22.0000, 28.0000, 310.0000, 25.0000, 1, NOW(), NOW(), 1, 1, 1),
(21, '7411000000218', 'Pasta de Tomate Natura\'s 200g', 'Pasta concentrada de tomate natural', 18.0000, 23.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 1, 1, 1),
(22, '7411000000225', 'Mayonesa Hellmann\'s Regular 390g', 'Mayonesa clásica para aderezar', 58.0000, 74.0000, 120.0000, 10.0000, 1, NOW(), NOW(), 1, 5, 1),
(23, '7411000000232', 'Ketchup Banquete Doypack 400g', 'Ketchup salsa dulce de tomate', 26.0000, 33.0000, 190.0000, 15.0000, 1, NOW(), NOW(), 1, 1, 1),
(24, '7411000000249', 'Salsa Lizano Botella 250ml', 'Salsa vegetal costarricense original', 35.0000, 45.0000, 130.0000, 12.0000, 1, NOW(), NOW(), 1, 5, 1),
(25, '7411000000256', 'Salsa Inglesa Mirasol 150ml', 'Salsa sazonadora para carnes', 12.0000, 16.5000, 150.0000, 10.0000, 1, NOW(), NOW(), 1, 5, 1),
(26, '7411000000263', 'Atún Sardimar en Aceite 140g', 'Lomitos de atún en aceite vegetal', 34.0000, 44.0000, 250.0000, 20.0000, 1, NOW(), NOW(), 1, 5, 1),
(27, '7411000000270', 'Atún Sardimar en Agua 140g', 'Lomitos de atún light en agua', 35.0000, 45.0000, 190.0000, 15.0000, 1, NOW(), NOW(), 1, 5, 1),
(28, '7411000000287', 'Sardinas Pica Pica en Salsa Roja 155g', 'Sardinas enteras picantes en salsa', 18.0000, 24.0000, 220.0000, 20.0000, 1, NOW(), NOW(), 1, 5, 1),
(29, '7411000000294', 'Frijoles Molidos Natura\'s 400g', 'Frijoles rojos refritos doypack', 18.0000, 23.5000, 380.0000, 30.0000, 1, NOW(), NOW(), 1, 1, 1),
(30, '7411000000300', 'Vinagre Blanco El Rey 1L', 'Vinagre blanco para ensaladas o desinfección', 14.0000, 19.0000, 120.0000, 10.0000, 1, NOW(), NOW(), 1, 5, 1),
(31, '7411000000317', 'Consomé de Pollo Maggi Caja 12u', 'Cubitos sazonadores de pollo', 15.0000, 20.0000, 340.0000, 30.0000, 1, NOW(), NOW(), 1, 5, 1),
(32, '7411000000324', 'Sopa de Caracol Maggi Sobres', 'Sopa deshidratada instantánea', 10.0000, 13.5000, 410.0000, 35.0000, 1, NOW(), NOW(), 1, 5, 1),
(33, '7411000000331', 'Gelatina Royal Fresa 80g', 'Polvo para preparar gelatina de fresa', 12.0000, 16.0000, 160.0000, 12.0000, 1, NOW(), NOW(), 1, 5, 1),
(34, '7411000000348', 'Polvo de Hornear Royal 100g', 'Polvo leudante para repostería', 24.0000, 32.0000, 95.0000, 8.0000, 1, NOW(), NOW(), 1, 5, 1),
(35, '7411000000355', 'Té Lipton Limón Caja 20 Sobres', 'Sobres de té negro con sabor a limón', 32.0000, 42.0000, 110.0000, 10.0000, 1, NOW(), NOW(), 1, 5, 1),

-- CATEGORÍA 2: Lácteos y Huevos (15 productos)
(36, '7411000000362', 'Leche Entera UHT Centrolac 1L', 'Leche entera pasteurizada caja', 27.5000, 34.0000, 300.0000, 20.0000, 1, NOW(), NOW(), 2, 3, 1),
(37, '7411000000379', 'Leche Descremada UHT Centrolac 1L', 'Leche descremada saludable caja', 29.0000, 36.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 2, 3, 1),
(38, '7411000000386', 'Leche Semidescremada Centrolac 1L', 'Leche semidescremada caja', 28.0000, 35.0000, 190.0000, 15.0000, 1, NOW(), NOW(), 2, 3, 1),
(39, '7411000000393', 'Leche en Polvo Nido 360g', 'Leche entera en polvo instantánea bolsa', 110.0000, 138.0000, 115.0000, 10.0000, 1, NOW(), NOW(), 2, 5, 1),
(40, '7411000000409', 'Queso Chontaleño Fresco 1lb', 'Queso blanco semiduro salado nicaragüense', 58.0000, 72.0000, 100.0000, 15.0000, 1, NOW(), NOW(), 2, 5, 2),
(41, '7411000000416', 'Queso Mozzarella Centrovalle 1lb', 'Queso mozzarella para derretir', 85.0000, 108.0000,  70.0000, 8.0000, 1, NOW(), NOW(), 2, 5, 1),
(42, '7411000000423', 'Quesillo Chontaleño 1lb', 'Quesillo de hebra tradicional', 70.0000, 88.0000,  85.0000, 10.0000, 1, NOW(), NOW(), 2, 5, 2),
(43, '7411000000430', 'Crema Salud bolsa 200ml', 'Crema de leche agria tradicional', 14.5000, 19.0000, 190.0000, 15.0000, 1, NOW(), NOW(), 2, 5, 2),
(44, '7411000000447', 'Mantequilla Dos Pinos 115g', 'Mantequilla de leche con sal barrita', 25.0000, 32.0000, 140.0000, 12.0000, 1, NOW(), NOW(), 2, 5, 1),
(45, '7411000000454', 'Margarina Mirasol 225g', 'Margarina vegetal suave tarrina', 20.0000, 26.5000, 160.0000, 15.0000, 1, NOW(), NOW(), 2, 1, 1),
(46, '7411000000461', 'Yogurt Yes Fresa 200g', 'Yogurt bebible sabor fresa', 15.0000, 19.5000, 120.0000, 10.0000, 1, NOW(), NOW(), 2, 5, 1),
(47, '7411000000478', 'Cajilla de Huevos La Pradera 30u', 'Cajilla de huevos medianos seleccionados', 125.0000, 155.0000,  90.0000, 8.0000, 1, NOW(), NOW(), 2, 5, 2),
(48, '7411000000485', 'Media Cajilla de Huevos 15u', 'Media cajilla de huevos seleccionados', 65.0000, 82.0000,  60.0000, 6.0000, 1, NOW(), NOW(), 2, 5, 2),
(49, '7411000000492', 'Crema Dulce Dos Pinos 250ml', 'Crema para batir o cocinar caja', 38.0000, 48.0000,  80.0000, 8.0000, 1, NOW(), NOW(), 2, 5, 1),
(50, '7411000000508', 'Leche Condensada Nestlé 395g', 'Leche condensada lata dulce', 42.0000, 53.0000,  95.0000, 10.0000, 1, NOW(), NOW(), 2, 5, 1),

-- CATEGORÍA 4: Bebidas (20 productos)
(51, '7411000000515', 'Coca-Cola Regular 2L', 'Gaseosa sabor cola familiar botella', 38.0000, 48.0000, 240.0000, 20.0000, 1, NOW(), NOW(), 4, 4, 1),
(52, '7411000000522', 'Coca-Cola Sabor Original 600ml', 'Gaseosa sabor cola personal', 20.0000, 25.0000, 300.0000, 25.0000, 1, NOW(), NOW(), 4, 4, 1),
(53, '7411000000539', 'Coca-Cola Zero 2L', 'Gaseosa sabor cola libre de azúcar', 38.0000, 48.0000, 120.0000, 10.0000, 1, NOW(), NOW(), 4, 4, 1),
(54, '7411000000546', 'Pepsi Regular 2L', 'Gaseosa Pepsi familiar botella', 32.0000, 40.0000, 210.0000, 20.0000, 1, NOW(), NOW(), 4, 1, 1),
(55, '7411000000553', 'Fanta Naranja 2L', 'Gaseosa sabor naranja familiar', 34.0000, 43.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 4, 4, 1),
(56, '7411000000560', 'Rojita Familiar 2L', 'Gaseosa tradicional roja de Nicaragua', 32.0000, 40.0000, 220.0000, 20.0000, 1, NOW(), NOW(), 4, 4, 1),
(57, '7411000000577', 'Agua Purificada Fuente Pura 1.5L', 'Agua de mesa sin gas botella', 14.0000, 18.0000, 300.0000, 30.0000, 1, NOW(), NOW(), 4, 4, 1),
(58, '7411000000584', 'Agua Purificada Fuente Pura 5L', 'Presentación familiar de agua purificada', 44.0000, 55.0000, 100.0000, 10.0000, 1, NOW(), NOW(), 4, 4, 1),
(59, '7411000000591', 'Jugo Jumex Fresa-Plátano 1L', 'Néctar de frutas en cartón', 30.0000, 38.0000, 150.0000, 15.0000, 1, NOW(), NOW(), 4, 1, 1),
(60, '7411000000607', 'Jugo Jumex Naranja 1L', 'Néctar sabor naranja cartón', 30.0000, 38.0000, 160.0000, 15.0000, 1, NOW(), NOW(), 4, 1, 1),
(61, '7411000000614', 'Cerveza Toña Lata 350ml', 'Cerveza rubia lager nacional de Nicaragua', 27.0000, 35.0000, 500.0000, 48.0000, 1, NOW(), NOW(), 4, 4, 1),
(62, '7411000000621', 'Cerveza Toña Botella 12oz Retornable', 'Cerveza Toña en botella de vidrio', 22.0000, 30.0000, 360.0000, 36.0000, 1, NOW(), NOW(), 4, 4, 1),
(63, '7411000000638', 'Cerveza Victoria Clásica Lata 350ml', 'Cerveza lager nacional tradicional', 27.0000, 35.0000, 380.0000, 48.0000, 1, NOW(), NOW(), 4, 4, 1),
(64, '7411000000645', 'Cerveza Victoria Frost Lata 350ml', 'Cerveza filtrada en frío suave', 28.0000, 36.0000, 420.0000, 48.0000, 1, NOW(), NOW(), 4, 4, 1),
(65, '7411000000652', 'Gatorade Sabor Limón 600ml', 'Bebida hidratante isotónica botella', 26.0000, 33.0000, 160.0000, 15.0000, 1, NOW(), NOW(), 4, 1, 1),
(66, '7411000000669', 'Bebida Energizante AMP 500ml', 'Bebida energizante lata', 24.0000, 30.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 4, 1, 1),
(67, '7411000000676', 'Ron Flor de Caña 7 Años 750ml', 'Ron gran reserva nicaragüense botella', 245.0000, 310.0000,  80.0000, 6.0000, 1, NOW(), NOW(), 4, 4, 1),
(68, '7411000000683', 'Ron Flor de Caña 4 Años Extra Seco 750ml', 'Ron blanco nicaragüense', 165.0000, 210.0000,  95.0000, 8.0000, 1, NOW(), NOW(), 4, 4, 1),
(69, '7411000000690', 'Jugo Petit Naranja 200ml', 'Jugo en cajita personal para niños', 9.0000, 12.0000, 260.0000, 20.0000, 1, NOW(), NOW(), 4, 1, 1),
(70, '7411000000706', 'Té Frío Lipton Durazno 500ml', 'Té helado listo para tomar botella', 18.0000, 23.0000, 140.0000, 12.0000, 1, NOW(), NOW(), 4, 4, 1),

-- CATEGORÍA 5: Limpieza del Hogar (15 productos)
(71, '7411000000713', 'Detergente Xedex Floral 1kg', 'Detergente en polvo multiusos para ropa', 74.0000, 92.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 5, 5, 1),
(72, '7411000000720', 'Detergente Surf Limón 1kg', 'Detergente en polvo económico', 50.0000, 65.0000, 220.0000, 20.0000, 1, NOW(), NOW(), 5, 5, 1),
(73, '7411000000737', 'Cloro El Rey 1L', 'Cloro blanqueador y desinfectante líquido', 18.0000, 24.0000, 250.0000, 25.0000, 1, NOW(), NOW(), 5, 5, 1),
(74, '7411000000744', 'Desinfectante Fabuloso Lavanda 1L', 'Limpiador de pisos y aromatizante líquido', 28.0000, 36.0000, 200.0000, 15.0000, 1, NOW(), NOW(), 5, 5, 1),
(75, '7411000000751', 'Lavaplatos Axion Limón Pasta 425g', 'Pasta lavaplatos quita grasa', 26.0000, 33.0000, 170.0000, 15.0000, 1, NOW(), NOW(), 5, 5, 1),
(76, '7411000000768', 'Suavizante Suavitel Bebé 1L', 'Suavizante de ropa aroma suave', 60.0000, 75.0000, 110.0000, 10.0000, 1, NOW(), NOW(), 5, 5, 1),
(77, '7411000000775', 'Desinfectante Pine-Sol Original 1L', 'Limpiador desinfectante aroma a pino', 54.0000, 68.0000, 100.0000, 10.0000, 1, NOW(), NOW(), 5, 5, 1),
(78, '7411000000782', 'Insecticida Baygon Aerosol 400ml', 'Insecticida mata moscas y zancudos', 90.0000, 118.0000, 90.0000, 8.0000, 1, NOW(), NOW(), 5, 5, 1),
(79, '7411000000799', 'Jabón de Lavar en Barra Lirio Azul', 'Jabón tradicional de barra para lavar ropa', 14.0000, 18.0000, 340.0000, 30.0000, 1, NOW(), NOW(), 5, 5, 1),
(80, '7411000000805', 'Limpiador de Vidrios Windex 500ml', 'Líquido limpia vidrios atomizador', 42.0000, 54.0000,  85.0000, 8.0000, 1, NOW(), NOW(), 5, 5, 1),
(81, '7411000000812', 'Esponja Scotch-Brite Multiusos', 'Esponja de fibra verde para trastes', 11.5000, 15.0000, 290.0000, 20.0000, 1, NOW(), NOW(), 5, 5, 1),
(82, '7411000000829', 'Papel Aluminio Reynold 30sq', 'Rollo de papel aluminio para cocina', 38.0000, 48.0000,  95.0000, 8.0000, 1, NOW(), NOW(), 5, 5, 1),
(83, '7411000000836', 'Bolsas para Basura Maspack Grande 10u', 'Bolsas plásticas resistentes para basura', 26.0000, 34.0000, 140.0000, 12.0000, 1, NOW(), NOW(), 5, 5, 1),
(84, '7411000000843', 'Pastilla Para Inodoro Harpic Blue 1u', 'Pastilla desinfectante color azul', 16.0000, 21.0000, 200.0000, 15.0000, 1, NOW(), NOW(), 5, 5, 1),
(85, '7411000000850', 'Fibra Metálica Scotch-Brite 1u', 'Espiral metálico para limpieza difícil', 10.0000, 13.5000, 180.0000, 10.0000, 1, NOW(), NOW(), 5, 5, 1),

-- CATEGORÍA 6: Cuidado Personal (15 productos)
(86, '7411000000867', 'Jabón Protex Avena 110g', 'Jabón antibacterial de tocador barra', 22.0000, 28.0000, 280.0000, 25.0000, 1, NOW(), NOW(), 6, 1, 1),
(87, '7411000000874', 'Jabón Dove Original 135g', 'Jabón de tocador humectante barra', 32.0000, 42.0000, 190.0000, 15.0000, 1, NOW(), NOW(), 6, 5, 1),
(88, '7411000000881', 'Champú Sedal Ceramidas 340ml', 'Champú para brillo y fuerza del cabello', 68.0000, 85.0000, 110.0000, 10.0000, 1, NOW(), NOW(), 6, 5, 1),
(89, '7411000000898', 'Acondicionador Sedal Ceramidas 340ml', 'Acondicionador para brillo de cabello', 68.0000, 85.0000,  90.0000, 8.0000, 1, NOW(), NOW(), 6, 5, 1),
(90, '7411000000904', 'Pasta Dental Colgate Triple Acción 75ml', 'Crema dental para protección anticaries', 24.0000, 32.0000, 240.0000, 20.0000, 1, NOW(), NOW(), 6, 1, 1),
(91, '7411000000911', 'Enjuague Bucal Colgate Plax 250ml', 'Enjuague bucal aliento fresco menta', 52.0000, 68.0000,  95.0000, 8.0000, 1, NOW(), NOW(), 6, 1, 1),
(92, '7411000000928', 'Desodorante Rexona Clinical Hombre 48g', 'Desodorante antitranspirante en barra', 110.0000, 142.0000, 80.0000, 8.0000, 1, NOW(), NOW(), 6, 5, 1),
(93, '7411000000935', 'Desodorante Rexona Clinical Mujer 48g', 'Desodorante antitranspirante barra dama', 110.0000, 142.0000, 85.0000, 8.0000, 1, NOW(), NOW(), 6, 5, 1),
(94, '7411000000942', 'Crema Corporal Nivea Milk Nutritiva 250ml', 'Crema humectante corporal piel seca', 78.0000, 98.0000,  90.0000, 8.0000, 1, NOW(), NOW(), 6, 5, 1),
(95, '7411000000959', 'Toallas Femeninas Kotex Normal 10u', 'Toallas sanitarias con alas absorción', 30.0000, 38.0000, 160.0000, 15.0000, 1, NOW(), NOW(), 6, 5, 1),
(96, '7411000000966', 'Rasuradora Gillette Prestobarba 3 2u', 'Máquina de afeitar desechable de 3 hojas', 40.0000, 52.0000, 150.0000, 15.0000, 1, NOW(), NOW(), 6, 5, 1),
(97, '7411000000973', 'Papel Higiénico Scott Rinde Max 4u', 'Papel higiénico de doble hoja rollo', 42.0000, 55.0000, 220.0000, 20.0000, 1, NOW(), NOW(), 6, 5, 1),
(98, '7411000000980', 'Toallitas Húmedas Huggies Limpieza 80u', 'Toallitas húmedas para bebé', 68.0000, 85.0000, 110.0000, 10.0000, 1, NOW(), NOW(), 6, 5, 1),
(99, '7411000000997', 'Champú Johnson\'s Baby Cabello Claro 200ml', 'Champú suave para bebés no lágrimas', 55.0000, 72.0000,  95.0000, 8.0000, 1, NOW(), NOW(), 6, 5, 1),
(100, '7411000001000', 'Talco Mexsana Desodorante 150g', 'Polvo desodorante para pies higiene', 72.0000, 90.0000, 80.0000, 8.0000, 1, NOW(), NOW(), 6, 1, 1),

-- CATEGORÍA 7: Embutidos y Cárnicos (10 productos)
(101, '7411000001017', 'Salchichón Pollo Delicia 1lb', 'Salchichón de pollo empacado', 42.0000, 53.0000, 120.0000, 12.0000, 1, NOW(), NOW(), 7, 2, 2),
(102, '7411000001024', 'Jamón de Pavo Cocido Delicia 250g', 'Jamón de pavo rebanado empaque', 54.0000, 68.0000,  95.0000, 10.0000, 1, NOW(), NOW(), 7, 2, 1),
(103, '7411000001031', 'Mortadela Suprema ICI 1lb', 'Mortadela de cerdo y res empacada', 36.0000, 45.0000, 110.0000, 12.0000, 1, NOW(), NOW(), 7, 2, 2),
(104, '7411000001048', 'Chorizo Criollo Cerdo ICI 454g', 'Chorizos criollos tradicionales bolsa', 48.0000, 62.0000, 100.0000, 10.0000, 1, NOW(), NOW(), 7, 2, 2),
(105, '7411000001055', 'Pollo Entero Tip-Top con Menudos 1kg', 'Pollo fresco entero congelado nacional', 78.0000, 98.0000, 140.0000, 15.0000, 1, NOW(), NOW(), 7, 2, 2),
(106, '7411000001062', 'Pechuga de Pollo Tip-Top 1kg', 'Pechuga deshuesada de pollo congelada', 115.0000, 146.0000,  95.0000, 10.0000, 1, NOW(), NOW(), 7, 2, 2),
(107, '7411000001079', 'Carne Molida Especial Res 1kg', 'Carne molida magra de res fresca', 130.0000, 165.0000,  85.0000, 8.0000, 1, NOW(), NOW(), 7, 2, 2),
(108, '7411000001086', 'Chuleta Lomo de Cerdo Fresca 1kg', 'Corte de chuleta de lomo de cerdo', 110.0000, 138.0000,  70.0000, 8.0000, 1, NOW(), NOW(), 7, 2, 2),
(109, '7411000001093', 'Salchicha Copetín Delicia 400g', 'Salchichas pequeñas tipo copetín', 32.0000, 40.0000, 130.0000, 12.0000, 1, NOW(), NOW(), 7, 2, 1),
(110, '7411000001109', 'Lomo de Res Premium 1kg', 'Filete de lomo de res tierno', 190.0000, 240.0000,  60.0000, 6.0000, 1, NOW(), NOW(), 7, 2, 2),

-- CATEGORÍA 8: Panadería y Repostería (10 productos)
(111, '7411000001116', 'Pan de Molde Bimbo Blanco Grande', 'Pan de barra blanco empacado grande', 55.0000, 70.0000, 180.0000, 15.0000, 1, NOW(), NOW(), 8, 6, 2),
(112, '7411000001123', 'Pan de Molde Integral Bimbo Grande', 'Pan de barra integral fibra', 58.0000, 74.0000, 130.0000, 12.0000, 1, NOW(), NOW(), 8, 6, 2),
(113, '7411000001130', 'Pan Hot Dog Bimbo 8u', 'Panes especiales para perros calientes', 38.0000, 48.0000, 110.0000, 10.0000, 1, NOW(), NOW(), 8, 6, 2),
(114, '7411000001147', 'Pan Hamburguesa Bimbo con Ajonjolí 8u', 'Panes con ajonjolí para hamburguesa', 42.0000, 54.0000, 115.0000, 10.0000, 1, NOW(), NOW(), 8, 6, 2),
(115, '7411000001154', 'Galletas Oreo Chocolate Paq 4u', 'Paquete de galletas sandwich de chocolate', 8.5000, 12.0000, 400.0000, 30.0000, 1, NOW(), NOW(), 8, 5, 1),
(116, '7411000001161', 'Galletas Club Social Original 6u', 'Galletas saladas crujientes empaque', 18.5000, 24.0000, 320.0000, 25.0000, 1, NOW(), NOW(), 8, 5, 1),
(117, '7411000001178', 'Pan Dulce Bimbo Nito 1u', 'Panecillo dulce relleno de chocolate', 14.0000, 18.0000, 160.0000, 15.0000, 1, NOW(), NOW(), 8, 6, 1),
(118, '7411000001185', 'Bizcocho Relleno Bimbo Donas 4u', 'Rosquillas donas glaseadas empaque', 28.0000, 36.0000,  95.0000, 10.0000, 1, NOW(), NOW(), 8, 6, 1),
(119, '7411000001192', 'Magdalena Bimbo Vainilla 250g', 'Pan magdalena sabor vainilla', 34.0000, 43.0000,  80.0000, 8.0000, 1, NOW(), NOW(), 8, 6, 2),
(120, '7411000001208', 'Tostadas Bimbo Clásicas Bolsa', 'Pan tostado crujiente clásico', 26.0000, 34.0000, 120.0000, 12.0000, 1, NOW(), NOW(), 8, 6, 2);

-- 6. Insertar Lotes de Prueba para módulo PEPS (Productos perecederos e inventariables)
-- Lotes con fechas de vencimiento realistas
INSERT INTO product_batches (id, batch_code, initial_quantity, current_quantity, entry_date, expiration_date, created_at, product_id) VALUES
-- Arroz Faisán 1lb (id: 1)
(1, 'LOTE-ARROZ-01', 300.0000, 300.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 240 DAY), NOW(), 1),
(2, 'LOTE-ARROZ-02', 150.0000, 150.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), NOW(), 1),
-- Frijol Seda (id: 4)
(3, 'LOTE-FRIJOL-01', 500.0000, 500.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 90 DAY), NOW(), 4),
-- Aceite Ideal 1L (id: 16)
(4, 'LOTE-ACEITE-01', 220.0000, 220.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY), NOW(), 16),
-- Leche Entera Centrolac 1L (id: 36)
(5, 'LOTE-LECHE-01', 200.0000, 200.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NOW(), 36),
(6, 'LOTE-LECHE-02', 100.0000, 100.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 8 DAY), NOW(), 36),
-- Huevos 30u (id: 47)
(7, 'LOTE-HUEVOS-01', 90.0000, 90.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), NOW(), 47),
-- Salchichón Pollo (id: 101)
(8, 'LOTE-SALCH-01', 120.0000, 120.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 22 DAY), NOW(), 101),
-- Jamón Pavo (id: 102)
(9, 'LOTE-JAMON-01', 95.0000, 95.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 12 DAY), NOW(), 102),
-- Pan Bimbo Blanco (id: 111)
(10, 'LOTE-PAN-01', 180.0000, 180.0000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 DAY), NOW(), 111);

-- 7. Insertar Clientes Demo
INSERT INTO customers (id, full_name, document_id, phone, email, address, created_at) VALUES
(1, 'Consumidor Final', NULL, NULL, NULL, NULL, NOW()),
(2, 'Adolfo Floreano Garth', '001-120594-1002Y', '+505 8489-3221', 'adolfo.floreano@gmail.com', 'Bello Horizonte, Managua', NOW()),
(3, 'María Auxiliadora Blandón', '281-221089-0002A', '+505 7765-8933', 'maria.blandon@yahoo.com', 'León, Nicaragua', NOW());

-- 8. Generar Empaques de Compra (Packs de Distribuidor) de forma automatizada por Categorías
-- Bebidas: Caja (24u), Cajilla (6u)
INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJILLA', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Bebidas');

INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 24, 1, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Bebidas');

-- Granos Básicos: Paquete (6u), Fardo (12u), Saco (50u)
INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Granos Básicos', 'Despensa');

INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'FARDO', 12, 0, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Granos Básicos', 'Despensa');

INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'SACO', 50, 1, 3 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Granos Básicos');

-- Lácteos, Panadería, Cuidado Personal, Limpieza: Paquete (6u), Caja/Fardo (12u)
INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Lácteos y Huevos', 'Panadería y Repostería', 'Cuidado Personal', 'Limpieza del Hogar', 'Snacks y Golosinas');

INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 12, 1, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Lácteos y Huevos', 'Panadería y Repostería', 'Cuidado Personal', 'Limpieza del Hogar', 'Snacks y Golosinas');

-- Empaques por defecto para todo producto (Unidad Base)
INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'UN', 1, 0, 0 FROM products p;

-- 9. Generar Conversiones UOM para Inmutabilidad y Escaneo con nuevo formato (codigo-factor)
INSERT INTO product_uom_conversions (product_id, barcode, label, factor, sale_price, is_purchase_default, is_sale_default, created_at, updated_at)
SELECT pp.product_id,
       CASE WHEN pp.label = 'UN' THEN p.barcode
            ELSE CONCAT(p.barcode, '-', CAST(pp.factor AS SIGNED))
       END,
       pp.label,
       pp.factor,
       CASE WHEN pp.label = 'UN' THEN p.sale_price ELSE p.sale_price * pp.factor END,
       pp.is_default,
       CASE WHEN pp.label = 'UN' THEN 1 ELSE 0 END,
       NOW(),
       NOW()
FROM product_purchase_packs pp
JOIN products p ON p.id = pp.product_id;

-- 10. Reactivar verificación de claves externas
SET FOREIGN_KEY_CHECKS = 1;
