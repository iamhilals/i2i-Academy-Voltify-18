-- ============================================================================
-- VoltWise / Voltify - PostgreSQL DDL Schema
-- ----------------------------------------------------------------------------
-- Bu script Docker (docker-entrypoint-initdb.d) tarafından, veritabanı ilk
-- kez oluşturulduğunda otomatik çalıştırılır. Tablo ve kolon adları JPA
-- entity eşlemeleriyle BİREBİR uyumludur (spring.jpa.hibernate.ddl-auto=update
-- bu şemayı yalnızca doğrular; hiçbir kolon yeniden oluşturulmaz).
-- Tüm ilişkiler ON DELETE CASCADE ile korunur (Section 5.6 - Relational Constraints).
-- ============================================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id           BIGSERIAL PRIMARY KEY,
    first_name   VARCHAR(255) NOT NULL,
    last_name    VARCHAR(255) NOT NULL,
    username     VARCHAR(255) NOT NULL UNIQUE,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(255) NOT NULL,
    password     VARCHAR(255) NOT NULL
);

-- 2. Homes
CREATE TABLE IF NOT EXISTS homes (
    id               BIGSERIAL PRIMARY KEY,
    owner_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    contact_email    VARCHAR(255) NOT NULL,
    power_quota_watt DOUBLE PRECISION NOT NULL DEFAULT 8800.0,
    budget_quota_try DOUBLE PRECISION NOT NULL DEFAULT 1500.0,
    base_rate        DOUBLE PRECISION NOT NULL DEFAULT 2.07,
    penalty_rate     DOUBLE PRECISION NOT NULL DEFAULT 5.18,
    square_meters    INTEGER,
    room_layout      VARCHAR(255)
);

-- 3. Appliances
CREATE TABLE IF NOT EXISTS appliances (
    id               BIGSERIAL PRIMARY KEY,
    home_id          BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    safe_power_limit DOUBLE PRECISION,
    room             VARCHAR(255),
    type             VARCHAR(255),
    power_on         BOOLEAN DEFAULT TRUE
);

-- 4. Billing Ledgers (her ev için tek kayıt)
CREATE TABLE IF NOT EXISTS billing_ledgers (
    id                 BIGSERIAL PRIMARY KEY,
    home_id            BIGINT NOT NULL UNIQUE REFERENCES homes(id) ON DELETE CASCADE,
    accumulated_watt   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    current_balance    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_penalty_active  BOOLEAN NOT NULL DEFAULT FALSE,
    breach80_notified  BOOLEAN NOT NULL DEFAULT FALSE,
    breach100_notified BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Consumption Snapshots (günlük geçmiş trend arşivi)
CREATE TABLE IF NOT EXISTS consumption_snapshots (
    id            BIGSERIAL PRIMARY KEY,
    home_id       BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    daily_watt    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    daily_cost    DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

-- 6. Event Logs (denetim izi: %80/%100 breach, penalty, anomali)
CREATE TABLE IF NOT EXISTS event_logs (
    id         BIGSERIAL PRIMARY KEY,
    home_id    BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    metadata   TEXT,
    timestamp  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI Recommendations (Gemini üretimi tavsiye geçmişi)
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id              BIGSERIAL PRIMARY KEY,
    home_id         BIGINT NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    generated_text  TEXT NOT NULL,
    trigger_context VARCHAR(50) NOT NULL,
    email_sent      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Eco Pets (VoltBot maskotu - kullanıcı başına tek kayıt)
CREATE TABLE IF NOT EXISTS eco_pets (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL DEFAULT 'VoltBot',
    health_score INTEGER NOT NULL DEFAULT 100,
    level        INTEGER NOT NULL DEFAULT 1,
    experience   INTEGER NOT NULL DEFAULT 0,
    food_count   INTEGER NOT NULL DEFAULT 5
);

-- Performans indeksleri
CREATE INDEX IF NOT EXISTS idx_homes_owner        ON homes(owner_id);
CREATE INDEX IF NOT EXISTS idx_appliances_home    ON appliances(home_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_home_date ON consumption_snapshots(home_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_events_home        ON event_logs(home_id);
CREATE INDEX IF NOT EXISTS idx_ai_home            ON ai_recommendations(home_id);
