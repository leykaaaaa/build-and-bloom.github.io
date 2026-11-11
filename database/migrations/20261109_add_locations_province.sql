USE build_and_bloom;

SET @province_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'locations'
      AND COLUMN_NAME = 'province'
);

SET @add_province_column = IF(
    @province_column_exists = 0,
    "ALTER TABLE locations ADD COLUMN province VARCHAR(100) NOT NULL DEFAULT 'Pangasinan'",
    'SELECT 1'
);

PREPARE add_province_column_stmt FROM @add_province_column;
EXECUTE add_province_column_stmt;
DEALLOCATE PREPARE add_province_column_stmt;
