-- ============================================================
-- Clinic Management System - MySQL Schema
-- Java 17 + Spring Boot 3.0.6
-- ============================================================

CREATE DATABASE IF NOT EXISTS clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinic_db;

-- ─── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    role        ENUM('ADMIN','DOCTOR','PATIENT') NOT NULL,
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Doctors ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE,
    full_name        VARCHAR(150) NOT NULL,
    specialty        VARCHAR(100) NOT NULL,
    phone            VARCHAR(20),
    license_number   VARCHAR(50) UNIQUE,
    available_slots  TEXT,
    slots_per_day    INT DEFAULT 20,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Patients ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL UNIQUE,
    full_name         VARCHAR(150) NOT NULL,
    date_of_birth     DATE,
    gender            VARCHAR(10),
    phone             VARCHAR(20),
    address           TEXT,
    blood_group       VARCHAR(5),
    emergency_contact VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Appointments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id        BIGINT NOT NULL,
    patient_id       BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot        TIME NOT NULL,
    status           ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    notes            TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_doctor_date_slot (doctor_id, appointment_date, time_slot),
    FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- ─── Prescriptions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id            BIGINT NOT NULL,
    doctor_id             BIGINT NOT NULL,
    appointment_id        BIGINT,
    disease               VARCHAR(200) NOT NULL,
    medications           TEXT,
    notes                 TEXT,
    dosage_instructions   TEXT,
    follow_up_date        DATETIME,
    timestamp             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    editable_by_doctor_id BIGINT NOT NULL,
    FOREIGN KEY (patient_id)            REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)             REFERENCES doctors(id)  ON DELETE CASCADE,
    FOREIGN KEY (appointment_id)        REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (editable_by_doctor_id) REFERENCES doctors(id)  ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin (password: Admin@1234)
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin@clinic.com', 'ADMIN');

-- Doctors (password: Doctor@123)
INSERT INTO users (username, password, email, role) VALUES
('dr_smith',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'smith@clinic.com',  'DOCTOR'),
('dr_patel',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'patel@clinic.com',  'DOCTOR'),
('dr_nguyen', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'nguyen@clinic.com', 'DOCTOR');

INSERT INTO doctors (user_id, full_name, specialty, phone, license_number, available_slots, slots_per_day)
SELECT id, 'Dr. John Smith',   'Cardiology',      '+1-555-0101', 'LIC-001',
       '09:00,09:15,09:30,09:45,10:00,10:15,10:30,10:45,11:00,11:15,14:00,14:15,14:30,14:45,15:00,15:15,15:30,15:45,16:00,16:15', 20
FROM users WHERE username='dr_smith';

INSERT INTO doctors (user_id, full_name, specialty, phone, license_number, available_slots, slots_per_day)
SELECT id, 'Dr. Priya Patel',  'Pediatrics',      '+1-555-0102', 'LIC-002',
       '09:00,09:15,09:30,09:45,10:00,10:15,10:30,10:45,11:00,11:15,14:00,14:15,14:30,14:45,15:00,15:15,15:30,15:45,16:00,16:15', 20
FROM users WHERE username='dr_patel';

INSERT INTO doctors (user_id, full_name, specialty, phone, license_number, available_slots, slots_per_day)
SELECT id, 'Dr. Minh Nguyen',  'Neurology',       '+1-555-0103', 'LIC-003',
       '09:00,09:15,09:30,09:45,10:00,10:15,10:30,10:45,11:00,11:15,14:00,14:15,14:30,14:45,15:00,15:15,15:30,15:45,16:00,16:15', 20
FROM users WHERE username='dr_nguyen';

-- Patients (password: Patient@123)
INSERT INTO users (username, password, email, role) VALUES
('john_doe',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'john@example.com',  'PATIENT'),
('jane_doe',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'jane@example.com',  'PATIENT'),
('bob_wilson', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'bob@example.com',   'PATIENT');

INSERT INTO patients (user_id, full_name, date_of_birth, gender, phone, blood_group)
SELECT id, 'John Doe',   '1985-03-15', 'Male',   '+1-555-1001', 'O+'  FROM users WHERE username='john_doe';
INSERT INTO patients (user_id, full_name, date_of_birth, gender, phone, blood_group)
SELECT id, 'Jane Doe',   '1990-07-22', 'Female', '+1-555-1002', 'A+'  FROM users WHERE username='jane_doe';
INSERT INTO patients (user_id, full_name, date_of_birth, gender, phone, blood_group)
SELECT id, 'Bob Wilson', '1978-11-30', 'Male',   '+1-555-1003', 'B+'  FROM users WHERE username='bob_wilson';

-- NOTE: Seed passwords use bcrypt hash for 'password' (Laravel default hash shown).
-- Use: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi. = "password"
-- For production, generate proper hashes via Spring's BCryptPasswordEncoder.
