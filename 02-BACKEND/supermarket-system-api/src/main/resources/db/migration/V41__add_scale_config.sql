CREATE TABLE `scale_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `prefix` varchar(10) NOT NULL DEFAULT '20',
  `plu_length` int NOT NULL DEFAULT 5,
  `weight_length` int NOT NULL DEFAULT 5,
  `divisor` decimal(10,4) NOT NULL DEFAULT 1000,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
