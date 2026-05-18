// src/app/features/doctor/dashboard/doctor-dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar.component';
import { DoctorService } from '../../../core/services/doctor.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar [links]="navLinks" />
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h2>Welcome, {{ profile()?.fullName || 'Doctor' }}</h2>
          <p>{{ profile()?.specialty }} · {{ today }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/doctor/appointments" class="btn-outline">View Appointments</a>
          <a routerLink="/doctor/prescriptions" class="btn-primary">New Prescription</a>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-value">{{ todayAppointments().length }}</div>
            <div class="stat-label">Today's Appointments</div>
          </div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalPatients().length }}</div>
            <div class="stat-label">Total Patients</div>
          </div>
        </div>
        <div class="stat-card purple">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ myPrescriptions().length }}</div>
            <div class="stat-label">Prescriptions Written</div>
          </div>
        </div>
        <div class="stat-card orange">
          <div class="stat-icon">🕐</div>
          <div class="stat-info">
            <div class="stat-value">{{ profile()?.slotsPerDay || 0 }}</div>
            <div class="stat-label">Daily Slots</div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Today's appointments -->
        <div class="card">
          <div class="card-header">
            <h3>Today's Schedule</h3>
            <a routerLink="/doctor/appointments" class="card-link">View All →</a>
          </div>
          @if (todayAppointments().length === 0) {
            <div class="empty-state">No appointments today</div>
          }
          @for (appt of todayAppointments().slice(0, 5); track appt.id) {
            <div class="appt-row">
              <div class="appt-time">{{ appt.timeSlot }}</div>
              <div class="appt-patient">
                <div class="patient-name">{{ appt.patientName }}</div>
                <div class="appt-status" [class]="appt.status.toLowerCase()">{{ appt.status }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Recent Prescriptions -->
        <div class="card">
          <div class="card-header">
            <h3>Recent Prescriptions</h3>
            <a routerLink="/doctor/prescriptions" class="card-link">View All →</a>
          </div>
          @if (myPrescriptions().length === 0) {
            <div class="empty-state">No prescriptions yet</div>
          }
          @for (rx of myPrescriptions().slice(0, 5); track rx.id) {
            <div class="rx-row">
              <div class="rx-patient">{{ rx.patientName }}</div>
              <div class="rx-info">
                <span class="disease">{{ rx.disease }}</span>
                <span class="rx-date">{{ rx.timestamp | date:'shortDate' }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px 32px; background: #0f172a; min-height: calc(100vh - 60px); color: #e2e8f0; font-family: 'Segoe UI', sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .page-header h2 { color: #f1f5f9; font-size: 24px; margin: 0 0 4px; }
    .page-header p { color: #64748b; margin: 0; font-size: 14px; }
    .header-actions { display: flex; gap: 12px; }
    .btn-primary { padding: 9px 20px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .btn-outline { padding: 9px 20px; border: 1px solid #334155; color: #94a3b8; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #1e293b; border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; border: 1px solid #334155; }
    .stat-card.blue { border-left: 3px solid #0ea5e9; }
    .stat-card.green { border-left: 3px solid #22c55e; }
    .stat-card.purple { border-left: 3px solid #a855f7; }
    .stat-card.orange { border-left: 3px solid #f97316; }
    .stat-icon { font-size: 28px; }
    .stat-value { font-size: 26px; font-weight: 700; color: #38bdf8; }
    .stat-label { color: #64748b; font-size: 12px; }
    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-header h3 { color: #f1f5f9; margin: 0; font-size: 16px; }
    .card-link { color: #38bdf8; font-size: 13px; text-decoration: none; }
    .empty-state { color: #475569; text-align: center; padding: 24px; font-size: 14px; }
    .appt-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #1e3a5f; }
    .appt-time { color: #38bdf8; font-size: 13px; font-weight: 600; min-width: 60px; }
    .patient-name { color: #e2e8f0; font-size: 14px; }
    .appt-status { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 2px; }
    .appt-status.scheduled { background: #1d4ed8; color: #bfdbfe; }
    .appt-status.completed { background: #14532d; color: #86efac; }
    .appt-status.cancelled { background: #450a0a; color: #fca5a5; }
    .rx-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-top: 1px solid #1e3a5f; }
    .rx-patient { color: #e2e8f0; font-size: 14px; font-weight: 500; }
    .rx-info { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .disease { color: #94a3b8; font-size: 12px; }
    .rx-date { color: #475569; font-size: 11px; }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  navLinks = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: '📊' },
    { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: '📋' }
  ];
  profile = signal<any>(null);
  todayAppointments = signal<any[]>([]);
  myPrescriptions = signal<any[]>([]);
  totalPatients = signal<any[]>([]);
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.doctorService.getMyProfile().subscribe(p => {
      this.profile.set(p);
      const today = new Date().toISOString().split('T')[0];
      this.appointmentService.getDoctorAppointments(p.id, today).subscribe(a => this.todayAppointments.set(a));
    });
    this.prescriptionService.getAllPrescriptions().subscribe(rx => this.myPrescriptions.set(rx));
    this.patientService.getAll().subscribe(p => this.totalPatients.set(p));
  }
}
