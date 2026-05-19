// src/app/features/patient/dashboard/patient-dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-icon">⚕</span>
          <span>ClinicHub</span>
        </div>
        <nav class="nav">
          <a routerLink="/patient/dashboard" class="nav-item active">🏠 Dashboard</a>
          <a routerLink="/patient/appointments" class="nav-item">📅 Appointments</a>
          <a routerLink="/patient/prescriptions" class="nav-item">💊 Prescriptions</a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar">{{ initials() }}</div>
            <div>
              <div class="user-name">{{ profile()?.fullName || user()?.username }}</div>
              <div class="user-role">Patient</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">Sign Out</button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="page-header">
          <div>
            <h1>Welcome back, {{ profile()?.fullName?.split(' ')[0] || 'Patient' }}!</h1>
            <p>Here's your health summary</p>
          </div>
          <a routerLink="/patient/appointments" class="btn-primary">Book Appointment</a>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ upcomingCount() }}</div>
            <div class="stat-label">Upcoming Appointments</div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">💊</div>
            <div class="stat-value">{{ prescriptionCount() }}</div>
            <div class="stat-label">Total Prescriptions</div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon">🩺</div>
            <div class="stat-value">{{ completedCount() }}</div>
            <div class="stat-label">Completed Visits</div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">🩸</div>
            <div class="stat-value">{{ profile()?.bloodGroup || '—' }}</div>
            <div class="stat-label">Blood Group</div>
          </div>
        </div>

        <!-- Upcoming appointments -->
        <div class="section">
          <div class="section-header">
            <h2>Upcoming Appointments</h2>
            <a routerLink="/patient/appointments" class="see-all">View All →</a>
          </div>
          @if (loadingAppts()) {
            <div class="loading-bar"></div>
          } @else if (upcomingAppts().length === 0) {
            <div class="empty-state">
              <span>📅</span>
              <p>No upcoming appointments. <a routerLink="/patient/appointments">Book one now</a></p>
            </div>
          } @else {
            <div class="appt-list">
              @for (a of upcomingAppts(); track a.id) {
                <div class="appt-card">
                  <div class="appt-icon">👨‍⚕️</div>
                  <div class="appt-info">
                    <strong>{{ a.doctorName }}</strong>
                    <span>{{ a.doctorSpecialty }}</span>
                  </div>
                  <div class="appt-time">
                    <strong>{{ a.appointmentDate | date:'MMM d' }}</strong>
                    <span>{{ a.timeSlot }}</span>
                  </div>
                  <div class="appt-status" [class]="'status-' + a.status.toLowerCase()">{{ a.status }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Recent prescriptions -->
        <div class="section">
          <div class="section-header">
            <h2>Recent Prescriptions</h2>
            <a routerLink="/patient/prescriptions" class="see-all">View All →</a>
          </div>
          @if (recentRx().length === 0) {
            <div class="empty-state"><span>💊</span><p>No prescriptions yet.</p></div>
          } @else {
            <div class="rx-list">
              @for (r of recentRx(); track r.id) {
                <div class="rx-card">
                  <div class="rx-dot"></div>
                  <div class="rx-info">
                    <strong>{{ r.disease }}</strong>
                    <span>By {{ r.doctorName }} · {{ r.timestamp | date:'MMM d, y' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Profile card -->
        @if (profile()) {
          <div class="section">
            <h2>My Profile</h2>
            <div class="profile-grid">
              <div class="profile-item"><span>Full Name</span><strong>{{ profile()!.fullName }}</strong></div>
              <div class="profile-item"><span>Date of Birth</span><strong>{{ profile()!.dateOfBirth | date:'mediumDate' }}</strong></div>
              <div class="profile-item"><span>Gender</span><strong>{{ profile()!.gender || '—' }}</strong></div>
              <div class="profile-item"><span>Phone</span><strong>{{ profile()!.phone || '—' }}</strong></div>
              <div class="profile-item"><span>Blood Group</span><strong>{{ profile()!.bloodGroup || '—' }}</strong></div>
              <div class="profile-item"><span>Emergency Contact</span><strong>{{ profile()!.emergencyContact || '—' }}</strong></div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard { display: flex; min-height: 100vh; font-family: 'Segoe UI', sans-serif; background: #f0f4f8; }
    /* Sidebar */
    .sidebar { width: 240px; background: linear-gradient(180deg,#1a237e,#283593); display: flex; flex-direction: column; padding: 24px 16px; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 10px; color: #fff; font-size: 20px; font-weight: 700; padding: 0 8px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .brand-icon { font-size: 28px; }
    .nav { flex: 1; padding-top: 20px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: block; padding: 10px 12px; border-radius: 8px; color: rgba(255,255,255,0.65); text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.15s; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.12); color: #fff; }
    .sidebar-footer { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }
    .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#42a5f5,#1565c0); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 13px; flex-shrink: 0; }
    .user-name { color: #fff; font-size: 13px; font-weight: 600; }
    .user-role { color: rgba(255,255,255,0.5); font-size: 11px; }
    .logout-btn { width: 100%; padding: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; transition: all 0.15s; }
    .logout-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
    /* Main */
    .main { flex: 1; padding: 32px; overflow-y: auto; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
    .page-header h1 { margin: 0 0 4px; font-size: 24px; color: #1a2a3a; }
    .page-header p { margin: 0; color: #64748b; font-size: 14px; }
    .btn-primary { background: #3949ab; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; text-decoration: none; font-size: 14px; cursor: pointer; }
    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 8px; }
    .stat-card.blue .stat-icon { font-size: 24px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a2a3a; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .stat-card.blue { border-top: 3px solid #1976d2; }
    .stat-card.green { border-top: 3px solid #388e3c; }
    .stat-card.purple { border-top: 3px solid #7b1fa2; }
    .stat-card.orange { border-top: 3px solid #f57c00; }
    /* Section */
    .section { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .section-header h2 { margin: 0; font-size: 17px; color: #1a2a3a; }
    .see-all { color: #1976d2; text-decoration: none; font-size: 13px; font-weight: 500; }
    .loading-bar { height: 4px; background: linear-gradient(90deg,#e2e8f0,#cbd5e1,#e2e8f0); border-radius: 2px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:-200px} 100%{background-position:200px} }
    .empty-state { text-align: center; padding: 32px; color: #94a3b8; }
    .empty-state span { font-size: 36px; display: block; margin-bottom: 8px; }
    .empty-state p { margin: 0; font-size: 14px; }
    .empty-state a { color: #1976d2; text-decoration: none; }
    /* Appointments */
    .appt-list { display: flex; flex-direction: column; gap: 10px; }
    .appt-card { display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; }
    .appt-icon { font-size: 24px; }
    .appt-info { flex: 1; }
    .appt-info strong { display: block; font-size: 14px; color: #1a2a3a; }
    .appt-info span { font-size: 12px; color: #64748b; }
    .appt-time { text-align: right; }
    .appt-time strong { display: block; font-size: 14px; color: #1a2a3a; }
    .appt-time span { font-size: 12px; color: #64748b; }
    .appt-status { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 10px; }
    .status-scheduled { background: #e3f2fd; color: #1565c0; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }
    .status-cancelled { background: #fce4ec; color: #c62828; }
    /* Prescriptions */
    .rx-list { display: flex; flex-direction: column; gap: 8px; }
    .rx-card { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; background: #f8fafc; }
    .rx-dot { width: 8px; height: 8px; border-radius: 50%; background: #7b1fa2; flex-shrink: 0; }
    .rx-info strong { display: block; font-size: 14px; color: #1a2a3a; }
    .rx-info span { font-size: 12px; color: #64748b; }
    /* Profile */
    .profile-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .profile-item span { display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .profile-item strong { font-size: 14px; color: #1a2a3a; }
  `]
})
export class PatientDashboardComponent implements OnInit {
  user = signal<any>(null);
  profile = signal<any>(null);
  appointments = signal<any[]>([]);
  prescriptions = signal<any[]>([]);
  loadingAppts = signal(true);

  upcomingCount = signal(0);
  completedCount = signal(0);
  prescriptionCount = signal(0);

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService,
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.user.set(this.authService.currentUser());
    this.patientService.getMyProfile().subscribe(p => this.profile.set(p));
    this.appointmentService.getMyAppointments().subscribe(data => {
      this.appointments.set(data);
      this.upcomingCount.set(data.filter(a => a.status === 'SCHEDULED').length);
      this.completedCount.set(data.filter(a => a.status === 'COMPLETED').length);
      this.loadingAppts.set(false);
    });
    this.prescriptionService.getMyPrescriptions().subscribe(data => {
      this.prescriptions.set(data);
      this.prescriptionCount.set(data.length);
    });
  }

  upcomingAppts() {
    return this.appointments().filter(a => a.status === 'SCHEDULED').slice(0, 3);
  }

  recentRx() {
    return this.prescriptions().slice(0, 3);
  }

  initials() {
    const name = this.profile()?.fullName || this.user()?.username || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout() { this.authService.logout(); }
}
