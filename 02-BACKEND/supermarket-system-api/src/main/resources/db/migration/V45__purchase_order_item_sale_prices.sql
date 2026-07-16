ALTER TABLE purchase_order_items
	ADD COLUMN sale_price_per_pack DECIMAL(12, 4) NULL AFTER cost_per_pack,
	ADD COLUMN sale_price_per_unit DECIMAL(12, 4) NULL AFTER sale_price_per_pack;
