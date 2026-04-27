-- Моковые данные для тестирования базы данных AeroAssist Pro

-- Вставка пользователей
INSERT INTO users (user_id, role, full_name, phone, email) VALUES
('11111111-1111-1111-1111-111111111111', 'passenger', 'Иван Иванов', '+7 (999) 123-45-67', 'ivan@example.com'),
('22222222-2222-2222-2222-222222222222', 'employee', 'Анна Смирнова', '+7 (999) 987-65-43', 'anna.s@aeroassist.ru'),
('33333333-3333-3333-3333-333333333333', 'dispatcher', 'Петр Петров', '+7 (900) 111-22-33', 'petr.dispatch@aeroassist.ru');

-- Вставка профиля пассажира
INSERT INTO passenger_profiles (profile_id, user_id, disability_type, preferences, language, emergency_contact) VALUES
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Колясочник (WCHC)', 'Требуется узкая коляска для посадки в самолет', 'ru', '+7 (999) 000-00-00 (Жена)');

-- Вставка профиля сотрудника
INSERT INTO employees (employee_id, user_id, qualification, shift, current_status, current_position) VALUES
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Старший агент по сопровождению', 'Дневная (08:00 - 20:00)', 'online', 'Стойка регистрации 15');

-- Вставка точек терминала
INSERT INTO terminal_points (point_id, zone, point_type, geometry, is_accessible) VALUES
('66666666-6666-6666-6666-666666666666', 'Терминал A', 'meeting_point', '{"lat": 55.410307, "lng": 37.902451}', true),
('77777777-7777-7777-7777-777777777777', 'Терминал A', 'gate', '{"lat": 55.411000, "lng": 37.903000}', true);

-- Вставка рейса
INSERT INTO flights (flight_id, flight_no, airline, direction, scheduled_time, gate, status) VALUES
('88888888-8888-8888-8888-888888888888', 'SU-1234', 'Аэрофлот', 'departure', CURRENT_TIMESTAMP + INTERVAL '3 hours', 'Гейт 12', 'on_time');

-- Вставка заявки на сопровождение
INSERT INTO requests (request_id, passenger_id, flight_id, employee_id, meeting_point_id, status, priority) VALUES
('99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'accepted', 'high');

-- Вставка события по заявке
INSERT INTO request_events (request_id, event_type, payload_json) VALUES
('99999999-9999-9999-9999-999999999999', 'created', '{"source": "passenger_app"}'),
('99999999-9999-9999-9999-999999999999', 'assigned', '{"employee": "Анна Смирнова"}');

-- Вставка отзыва
INSERT INTO feedback (request_id, score, comment) VALUES
('99999999-9999-9999-9999-999999999999', 5, 'Отличное сопровождение, спасибо Анне!');
