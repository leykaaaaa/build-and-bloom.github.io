DELIMITER //

CREATE PROCEDURE add_crop_flood_and_drainage_requirements()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'crop_requirements'
          AND COLUMN_NAME = 'flood_tolerance'
    ) THEN
        ALTER TABLE crop_requirements
            ADD COLUMN flood_tolerance VARCHAR(100) NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'crop_requirements'
          AND COLUMN_NAME = 'drainage_requirement'
    ) THEN
        ALTER TABLE crop_requirements
            ADD COLUMN drainage_requirement VARCHAR(100) NULL;
    END IF;
END//

CALL add_crop_flood_and_drainage_requirements()//
DROP PROCEDURE add_crop_flood_and_drainage_requirements//

DELIMITER ;