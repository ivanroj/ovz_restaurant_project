-- Создание таблиц для проекта AeroAssist Pro
-- Диалект: PostgreSQL

-- 1. Пользователи (базовые учетные записи)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL, -- passenger, employee, dispatcher, admin
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Профили пассажиров (1:1 с users)
CREATE TABLE passenger_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    disability_type VARCHAR(100),
    preferences TEXT,
    language VARCHAR(10) DEFAULT 'ru',
    emergency_contact VARCHAR(255)
);

-- 3. Сотрудники (1:1 с users)
CREATE TABLE employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    qualification VARCHAR(255),
    shift VARCHAR(100),
    current_status VARCHAR(50), -- online, busy, offline
    current_position VARCHAR(255)
);

-- 4. Рейсы
CREATE TABLE flights (
    flight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_no VARCHAR(50) NOT NULL,
    airline VARCHAR(100),
    direction VARCHAR(100), -- arrival, departure
    scheduled_time TIMESTAMP WITH TIME ZONE,
    gate VARCHAR(50),
    status VARCHAR(50)
);

-- 5. Точки терминала
CREATE TABLE terminal_points (
    point_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone VARCHAR(100),
    point_type VARCHAR(100), -- meeting_point, gate, check_in, etc.
    geometry TEXT, -- JSON или координаты, для PostgreSQL можно использовать PostGIS (тип geometry)
    is_accessible BOOLEAN DEFAULT true
);

-- 6. Заявки на сопровождение
CREATE TABLE requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL REFERENCES passenger_profiles(profile_id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(flight_id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(employee_id) ON DELETE SET NULL,
    meeting_point_id UUID REFERENCES terminal_points(point_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. История событий по заявке
CREATE TABLE request_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(request_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- created, status_changed, assigned, etc.
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payload_json JSONB
);

-- 8. Отзывы и оценка качества
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES requests(request_id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации частых запросов
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_passenger ON requests(passenger_id);
CREATE INDEX idx_requests_employee ON requests(employee_id);
CREATE INDEX idx_flights_time ON flights(scheduled_time);
CREATE INDEX idx_request_events_req_id ON request_events(request_id);
