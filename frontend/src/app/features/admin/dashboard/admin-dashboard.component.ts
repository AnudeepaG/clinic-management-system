// src/app/features/admin/dashboard/admin-dashboard.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar.component';
import { environment } from '../../../../environments/environment';
import { DoctorService } from '../../../core/services/doctor.service';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [links]="navLinks" />
    <div class="dashboard">
      <div class="page-header">
        <h2>Admin Dashboard</h2>
        <p>System overview and doctor management</p>
      </div>

      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon doctor-icon">👨‍⚕️</div>
          <div class="stat-info">
            <div class="stat-value">{{ doctors().length }}</div>
            <div class="stat-label">Doctors</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon patient-icon">🧑‍⚕️</div>
          <div class="stat-info">
            <div class="stat-value">{{ patients().length }}</div>
            <div class="stat-label">Patients</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button [class.active]="activeTab() === 'doctors'" (click)="activeTab.set('doctors')">Doctors</button>
        <button [class.active]="activeTab() === 'patients'" (click)="activeTab.set('patients')">Patients</button>
        <button [class.active]="activeTab() === 'register'" (click)="activeTab.set('register')">Register Doctor</button>
      </div>

      <!-- Doctors Table -->
      @if (activeTab() === 'doctors') {
        <div class="table-card">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Specialty</th><th>Email</th><th>License</th><th>Slots/Day</th></tr>
            </thead>
            <tbody>
              @for (d of doctors(); track d.id) {
                <tr>
                  <td>{{ d.id }}</td>
                  <td>{{ d.fullName }}</td>
                  <td><span class="spec-badge">{{ d.specialty }}</span></td>
                  <td>{{ d.email }}</td>
                  <td>{{ d.licenseNumber }}</td>
                  <td>{{ d.slotsPerDay }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Patients Table -->
      @if (activeTab() === 'patients') {
        <div class="table-card">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Gender</th><th>Blood Group</th><th>Phone</th></tr>
            </thead>
            <tbody>
              @for (p of patients(); track p.id) {
                <tr>
                  <td>{{ p.id }}</td>
                  <td>{{ p.fullName }}</td>
                  <td>{{ p.email }}</td>
                  <td>{{ p.gender }}</td>
                  <td>{{ p.bloodGroup }}</td>
                  <td>{{ p.phone }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Register Doctor Form -->
      @if (activeTab() === 'register') {
        <div class="form-card">
          <h3>Register New Doctor</h3>
          <div class="row-2">
            <div class="field"><label>Username *</label>
              <input [(ngModel)]="regForm.username" placeholder="Username" /></div>
            <div class="field"><label>Email *</label>
              <input type="email" [(ngModel)]="regForm.email" placeholder="Email" /></div>
          </div>
          <div class="row-2">
            <div class="field"><label>Password *</label>
              <input type="password" [(ngModel)]="regForm.password" placeholder="Password" /></div>
            <div class="field"><label>Full Name *</label>
              <input [(ngModel)]="regForm.fullName" placeholder="Dr. Full Name" /></div>
          </div>
          <div class="row-2">
            <div class="field"><label>Specialty *</label>
              <input [(ngModel)]="regForm.specialty" placeholder="e.g. Cardiology" /></div>
            <div class="field"><label>License Number</label>
              <input [(ngModel)]="regForm.licenseNumber" placeholder="LIC-XXX" /></div>
          </div>
          <div class="field"><label>Phone</label>
            <input [(ngModel)]="regForm.phone" placeholder="Phone number" /></div>
          @if (regError()) { <div class="error-msg">{{ regError() }}</div> }
          @if (regSuccess()) { <div class="success-msg">{{ regSuccess() }}</div> }
          <button class="btn-primary" (click)="registerDoctor()" [disabled]="regLoading()">
            {{ regLoading() ? 'Registering…' : 'Register Doctor' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px 32px; background: #0f172a; min-height: calc(100vh - 60px); color: #e2e8f0; font-family: 'Segoe UI', sans-serif; }
    .page-header { margin-bottom: 24px; }
    .page-header h2 { color: #f1f5f9; font-size: 24px; margin: 0 0 4px; }
    .page-header p { color: #64748b; margin: 0; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #1e293b; border-radius: 12px; padding: 20px; display: flex; gap: 16px; align-items: center; border: 1px solid #334155; }
    .stat-icon { font-size: 32px; }
    .stat-value { font-size: 28px; font-weight: 700; color: #38bdf8; }
    .stat-label { color: #64748b; font-size: 13px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; }
    .tabs button { padding: 8px 20px; border-radius: 8px; border: 1px solid #334155; background: transparent; color: #64748b; cursor: pointer; font-size: 14px; }
    .tabs button.active { background: #0ea5e9; color: white; border-color: #0ea5e9; }
    .table-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #0f172a; }
    th { padding: 12px 16px; text-align: left; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    td { padding: 12px 16px; color: #cbd5e1; font-size: 14px; border-top: 1px solid #1e293b; }
    tr:hover td { background: #1a2942; }
    .spec-badge { background: #0c4a6e; color: #38bdf8; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
    .form-card { background: #1e293b; border-radius: 12px; padding: 28px; border: 1px solid #334155; max-width: 600px; }
    .form-card h3 { color: #f1f5f9; margin: 0 0 20px; font-size: 18px; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; color: #94a3b8; font-size: 12px; margin-bottom: 5px; font-weight: 500; }
    .field input { width: 100%; padding: 10px 12px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 13px; box-sizing: border-box; }
    .field input:focus { outline: none; border-color: #38bdf8; }
    .error-msg { background: #450a0a; color: #fca5a5; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
    .success-msg { background: #052e16; color: #86efac; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
    .btn-primary { padding: 10px 24px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  navLinks = [{ label: 'Dashboard', path: '/admin', icon: '📊' }];
  activeTab = signal('doctors');
  doctors = signal<any[]>([]);
  patients = signal<any[]>([]);
  regLoading = signal(false);
  regError = signal('');
  regSuccess = signal('');
  regForm = { username: '', email: '', password: '', fullName: '', specialty: '', phone: '', licenseNumber: '' };

  constructor(private doctorService: DoctorService, private patientService: PatientService, private http: HttpClient) {}

  ngOnInit(): void {
    this.doctorService.getAll().subscribe(d => this.doctors.set(d));
    this.patientService.getAll().subscribe(p => this.patients.set(p));
  }

  registerDoctor(): void {
    if (!this.regForm.username || !this.regForm.email || !this.regForm.password || !this.regForm.fullName || !this.regForm.specialty) {
      this.regError.set('Please fill in all required fields'); return;
    }
    this.regLoading.set(true); this.regError.set(''); this.regSuccess.set('');
    this.http.post(`${environment.apiUrl}/auth/register/doctor`, this.regForm,
      { headers: { 'X-Admin-Secret': 'CLINIC_ADMIN_SECRET_2024' } })
      .subscribe({
        next: () => {
          this.regLoading.set(false);
          this.regSuccess.set('Doctor registered successfully!');
          this.regForm = { username: '', email: '', password: '', fullName: '', specialty: '', phone: '', licenseNumber: '' };
          this.doctorService.getAll().subscribe(d => this.doctors.set(d));
        },
        error: (err) => { this.regLoading.set(false); this.regError.set(err.error?.error || 'Registration failed'); }
      });
  }
}
