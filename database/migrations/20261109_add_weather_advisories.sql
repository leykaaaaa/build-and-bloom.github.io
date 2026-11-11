CREATE TABLE IF NOT EXISTS weather_advisories (
    advisory_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    advisory_type VARCHAR(50) NOT NULL,
    priority ENUM('info', 'warning', 'high') NOT NULL DEFAULT 'info',
    target_scope ENUM('all', 'location') NOT NULL DEFAULT 'all',
    location_id INT NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE SET NULL,

    FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS weather_advisory_reads (
    advisory_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (advisory_id, user_id),

    FOREIGN KEY (advisory_id)
        REFERENCES weather_advisories(advisory_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);
