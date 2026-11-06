USE build_and_bloom;

SET @location_id_column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'planting_calendar'
        AND COLUMN_NAME = 'location_id'
);

SET @add_location_id_column = IF(
    @location_id_column_exists = 0,
    'ALTER TABLE planting_calendar ADD COLUMN location_id INT NULL AFTER crop_id',
    'SELECT 1'
);

PREPARE add_location_id_column_stmt FROM @add_location_id_column;
EXECUTE add_location_id_column_stmt;
DEALLOCATE PREPARE add_location_id_column_stmt;

ALTER TABLE planting_calendar
    MODIFY location_id INT NULL;

SET @location_id_foreign_key_exists = (
    SELECT COUNT(*)
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'planting_calendar'
        AND COLUMN_NAME = 'location_id'
        AND REFERENCED_TABLE_NAME = 'locations'
);

SET @add_location_id_foreign_key = IF(
    @location_id_foreign_key_exists = 0,
    'ALTER TABLE planting_calendar ADD CONSTRAINT fk_planting_calendar_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL',
    'SELECT 1'
);

PREPARE add_location_id_foreign_key_stmt FROM @add_location_id_foreign_key;
EXECUTE add_location_id_foreign_key_stmt;
DEALLOCATE PREPARE add_location_id_foreign_key_stmt;
