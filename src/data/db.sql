CREATE TABLE IF NOT EXISTS bots (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    full_name VARCHAR(150),
    age INTEGER,
    university VARCHAR(200),
    phone VARCHAR(50),
    email VARCHAR(250) UNIQUE,
    password VARCHAR,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    photo_url VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);