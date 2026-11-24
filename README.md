# MediCore — Doctor-Patient Management System
## Java 17 + Spring Boot 3.0.6 + Angular 21

##SCREENSHOTS

<img width="1906" height="868" alt="image" src="https://github.com/user-attachments/assets/b5048dd2-df87-4f89-b372-c4c410ec4ed5" />
<img width="1908" height="888" alt="image" src="https://github.com/user-attachments/assets/dbb651dd-baee-44cf-97b4-79712aed5954" />





---

## 📁 Project Structure

```
clinic-app/
├── schema.sql                          ← MySQL schema + seed data
├── README.md
│
├── backend/                            ← Spring Boot 3.0.6 / Java 17
│   ├── pom.xml
│   └── src/main/java/com/clinic/
│       ├── ClinicManagementApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── DoctorController.java
│       │   ├── PatientController.java
│       │   ├── AppointmentController.java
│       │   └── PrescriptionController.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Doctor.java
│       │   ├── Patient.java
│       │   ├── Appointment.java
│       │   └── Prescription.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── DoctorRepository.java
│       │   ├── PatientRepository.java
│       │   ├── AppointmentRepository.java
│       │   └── PrescriptionRepository.java
│       └── security/
│           ├── JwtUtils.java
│           ├── JwtAuthenticationFilter.java
│           └── UserDetailsServiceImpl.java
│
└── frontend/                           ← Angular 21 (all standalone components)
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── main.ts
        ├── index.html
        ├── styles.css
        ├── environments/
        │   ├── environment.ts
        │   └── environment.prod.ts
        └── app/
            ├── app.component.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── core/
            │   ├── guards/
            │   │   ├── auth.guard.ts
            │   │   └── role.guard.ts
            │   ├── interceptors/
            │   │   └── auth.interceptor.ts
            │   └── services/
            │       ├── auth.service.ts
            │       ├── appointment.service.ts
            │       ├── doctor.service.ts
            │       ├── patient.service.ts
            │       └── prescription.service.ts
            └── features/
                ├── auth/
                │   ├── login/login.component.ts
                │   └── register/register.component.ts
                ├── admin/dashboard/admin-dashboard.component.ts
                ├── doctor/
                │   ├── dashboard/doctor-dashboard.component.ts
                │   ├── appointments/doctor-appointments.component.ts
                │   └── prescriptions/doctor-prescriptions.component.ts
                └── patient/
                    ├── dashboard/patient-dashboard.component.ts
                    ├── appointments/patient-appointments.component.ts
                    └── prescriptions/patient-prescriptions.component.ts
```

---

## 🚀 Prerequisites

- Java 17 (e.g. Temurin/OpenJDK)
- Maven 3.8+
- Node.js 20+ & npm 10+
- Angular CLI 21: `npm install -g @angular/cli@21`
- MySQL 8.0+

---

## 🗄️ Database Setup

```sql
-- 1. Create database and run schema
mysql -u root -p < schema.sql
```

Or manually:
```sql
CREATE DATABASE clinic_db CHARACTER SET utf8mb4;
-- Then run schema.sql contents
```

Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/clinic_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
```

---

## ⚙️ Backend – Spring Boot

```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

### Key API Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | ALL | Login (returns JWT) |
| POST | /api/auth/register/patient | PUBLIC | Patient self-registration |
| POST | /api/auth/register/doctor | ADMIN* | Register doctor |
| GET | /api/doctors | AUTH | List all doctors |
| GET | /api/doctors/me | DOCTOR | Doctor's own profile |
| PUT | /api/doctors/{id}/slots | DOCTOR | Update available slots |
| GET | /api/patients | DOCTOR/ADMIN | List all patients |
| GET | /api/patients/me | PATIENT | Patient's own profile |
| GET | /api/appointments/slots | AUTH | Available slots by doctor+date |
| POST | /api/appointments/book | PATIENT | Book appointment |
| GET | /api/appointments/my | PATIENT | Patient's appointments |
| GET | /api/appointments/doctor/{id} | DOCTOR | Doctor's appointments |
| PUT | /api/appointments/{id}/status | DOCTOR | Update status |
| GET | /api/prescriptions/all | DOCTOR/ADMIN | All prescriptions (read) |
| GET | /api/prescriptions/my | PATIENT | My prescriptions |
| POST | /api/prescriptions | DOCTOR | Create prescription |
| PUT | /api/prescriptions/{id} | DOCTOR (prescriber only) | Edit prescription |
| DELETE | /api/prescriptions/{id} | DOCTOR (prescriber only) | Delete prescription |

*Doctor registration requires `X-Admin-Secret: CLINIC_ADMIN_SECRET_2024` header

---

## 🌐 Frontend – Angular 21

```bash
cd frontend
npm install
ng serve
```

Frontend runs at: **http://localhost:4200**

---

## 🔐 Demo Credentials

After running schema.sql seed data:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | password |
| Doctor | dr_smith | password |
| Doctor | dr_patel | password |
| Doctor | dr_nguyen | password |
| Patient | john_doe | password |
| Patient | jane_doe | password |

> **Note:** Seed data uses BCrypt hash for "password". For production, generate proper hashes.

---

## 📋 Role-Based Access Summary

### Admin
- Login via backend only (X-Admin-Secret header required to register)
- Full read access to all entities via admin endpoints
- Can register new doctors

### Doctor
- Registered via backend (admin action)
- Logs in via frontend
- Can manage their own patients and appointments
- Can create prescriptions for any patient
- Can only EDIT/DELETE their own prescriptions
- Can READ all prescriptions in the clinic

### Patient
- Self-registers via frontend
- Logs in via frontend
- Can book one 15-minute slot per doctor per day
- Can view/cancel their own appointments
- Can view (read-only) their own prescriptions

---

## 🗺️ Phased Enhancement Plan

### MVP (Delivered)
- ✅ JWT authentication with role-based access
- ✅ Doctor/Patient/Admin entities and CRUD
- ✅ Slot-based appointment booking with double-booking prevention
- ✅ Prescription CRUD with edit restriction to prescribing doctor
- ✅ Angular 21 standalone components with signals
- ✅ HTTP interceptor for JWT token injection
- ✅ Route guards (auth + role)

### Phase 2
- [ ] Email notifications (appointment confirmation, prescription updates)
- [ ] Admin dashboard with analytics charts
- [ ] Doctor availability calendar (weekly view)
- [ ] Prescription PDF export
- [ ] Patient medical history timeline

### Phase 3
- [ ] Real-time slot updates via WebSocket/SSE
- [ ] Two-factor authentication
- [ ] Audit logs for all sensitive actions
- [ ] Prescription drug interaction warnings
- [ ] Mobile-responsive PWA
- [ ] Billing and invoice module

---

## 🔧 Common Issues

**CORS error:** Ensure `app.cors.allowed-origins=http://localhost:4200` in application.properties

**JWT expired:** Increase `app.jwt.expiration` (ms) in application.properties

**MySQL timezone:** Add `?serverTimezone=UTC` to JDBC URL

**Angular 21 build errors:** Ensure Node 20+ and `@angular/cli@21` installed globally
