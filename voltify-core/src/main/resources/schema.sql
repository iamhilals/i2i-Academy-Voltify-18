-- VoltWise / Voltify Official PostgreSQL DDL Schema Script
-- Strictly adheres to Section 5.6 & Section 6 Deliverables of Technical Specification

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Homes Table
CREATE TABLE IF NOT EXISTS homes (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    power_quota_watt DOUBLE PRECISION DEFAULT 3500.0,
    budget_quota_try DOUBLE PRECISION DEFAULT 1500.0,
    base_rate DOUBLE PRECISION DEFAULT 2.07,
    penalty_rate DOUBLE PRECISION DEFAULT 5.18,
    square_meters INT DEFAULT 120,
    room_layout VARCHAR(50) DEFAULT '2+1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Appliances Table
CREATE TABLE IF NOT EXISTS appliances (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT REFERENCES homes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    safe_power_limit DOUBLE PRECISION NOT NULL DEFAULT 1500.0,
    room VARCHAR(100) DEFAULT 'Salon',
    type VARCHAR(100) DEFAULT 'Elektronik',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Billing Ledger Table
CREATE TABLE IF NOT EXISTS billing_ledger (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT UNIQUE REFERENCES homes(id) ON DELETE CASCADE,
    accumulated_watt DOUBLE PRECISION DEFAULT 0.0,
    current_balance DOUBLE PRECISION DEFAULT 0.0,
    is_penalty_active BOOLEAN DEFAULT FALSE,
    breach_80_notified BOOLEAN DEFAULT FALSE,
    breach_100_notified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Consumption Snapshots Table
CREATE TABLE IF NOT EXISTS consumption_snapshots (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT REFERENCES homes(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_kwh DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_cost_try DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Event Logs Table
CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT REFERENCES homes(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id BIGSERIAL PRIMARY KEY,
    home_id BIGINT REFERENCES homes(id) ON DELETE CASCADE,
    prompt_sent TEXT,
    recommendation_text TEXT NOT NULL,
    sent_via_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Eco Pet Table
CREATE TABLE IF NOT EXISTS eco_pets (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'VoltBot',
    level INT DEFAULT 1,
    experience_points INT DEFAULT 0,
    health_points INT DEFAULT 100,
    status VARCHAR(50) DEFAULT 'HAPPY',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_homes_owner ON homes(owner_id);
CREATE INDEX IF NOT EXISTS idx_appliances_home ON appliances(home_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_home_date ON consumption_snapshots(home_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_events_home ON event_logs(home_id);
