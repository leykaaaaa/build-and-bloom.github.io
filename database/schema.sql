-- ============================================
-- BUILD & BLOOM
-- Plant Management Decision Support System
-- Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS build_and_bloom;

USE build_and_bloom;


-- ============================================
-- 1. USERS
-- ============================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    location_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 2. LOCATIONS
-- Pangasinan cities and municipalities
-- ============================================

CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL UNIQUE,
    location_type ENUM('City', 'Municipality') NOT NULL,
    province VARCHAR(100) NOT NULL DEFAULT 'Pangasinan'
);


-- ============================================
-- 3. CROPS
-- Basic crop information
-- ============================================

CREATE TABLE crops (
    crop_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    growing_period VARCHAR(100),
    harvest_period VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 4. CROP REQUIREMENTS
-- Conditions required by each crop
-- ============================================

CREATE TABLE crop_requirements (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NOT NULL,

    soil_type VARCHAR(255),
    water_requirement VARCHAR(100),
    sunlight_requirement VARCHAR(100),

    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),

    season VARCHAR(255),
    environment VARCHAR(255),
    flood_tolerance VARCHAR(100),
    drainage_requirement VARCHAR(100),

    FOREIGN KEY (crop_id)
        REFERENCES crops(crop_id)
        ON DELETE CASCADE
);


-- ============================================
-- 5. PLANTING CALENDAR
-- General crop and seasonal planting information; location is optional
-- ============================================

CREATE TABLE planting_calendar (
    calendar_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NOT NULL,
    location_id INT NULL,

    planting_month VARCHAR(100),
    season VARCHAR(100),

    growing_period VARCHAR(100),
    harvest_period VARCHAR(100),

    notes TEXT,

    FOREIGN KEY (crop_id)
        REFERENCES crops(crop_id)
        ON DELETE CASCADE,

    FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE SET NULL
);


-- ============================================
-- 6. RECOMMENDATIONS
-- Stores assessment results
-- ============================================

CREATE TABLE recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,
    crop_id INT NOT NULL,
    location_id INT NULL,

    compatibility_score DECIMAL(5,2),
    compatibility_level VARCHAR(50),

    explanation TEXT,

    assessment_soil VARCHAR(100),
    assessment_water VARCHAR(100),
    assessment_sunlight VARCHAR(100),
    assessment_environment VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    FOREIGN KEY (crop_id)
        REFERENCES crops(crop_id)
        ON DELETE CASCADE,

    FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE SET NULL
);


-- ============================================
-- 7. WEATHER RECORDS
-- Weather data retrieved from OpenWeatherMap
-- ============================================

CREATE TABLE weather_records (
    weather_id INT AUTO_INCREMENT PRIMARY KEY,

    location_id INT NULL,

    temperature DECIMAL(5,2),
    feels_like DECIMAL(5,2),
    humidity INT,
    rainfall DECIMAL(8,2),

    weather_condition VARCHAR(100),
    weather_description VARCHAR(255),

    wind_speed DECIMAL(6,2),

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE SET NULL
);


-- ============================================
-- 8. PLANTING PLANS
-- User's selected plants
-- ============================================

CREATE TABLE planting_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,
    crop_id INT NOT NULL,
    location_id INT NULL,

    plan_name VARCHAR(150) NOT NULL,

    planting_date DATE,
    quantity VARCHAR(100),
    growing_method VARCHAR(100),

    notes TEXT,

    status ENUM(
        'Planned',
        'Growing',
        'Harvested',
        'Completed'
    ) DEFAULT 'Planned',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (crop_id)
        REFERENCES crops(crop_id)
        ON DELETE CASCADE,

    FOREIGN KEY (location_id)
        REFERENCES locations(location_id)
        ON DELETE SET NULL
);


-- ============================================
-- FOREIGN KEY: USERS → LOCATIONS
-- Added after both tables exist
-- ============================================

ALTER TABLE users
ADD CONSTRAINT fk_users_location
FOREIGN KEY (location_id)
REFERENCES locations(location_id)
ON DELETE SET NULL;