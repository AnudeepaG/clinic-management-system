// src/app/features/patient/prescriptions/patient-prescriptions.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <nav class="topbar">
        <a routerLink="/patient/dashboard" class="back">← Dashboard</a>
        <h2>My Prescriptions</h2>
      </nav>

      @if (loading()) {
        <div class="loading">Loading prescriptions…</div>
      } @else if (prescriptions().length === 0) {
        <div class="empty-state">
          <span>💊</span>
          <p>No prescriptions yet. Book an appointment to get started.</p>
          <a routerLink="/patient/appointments" class="btn-primary">Book Appointment</a>
        </div>
      } @else {
        <div class="rx-grid">
          @for (p of prescriptions(); track p.id) {
            <div class="rx-card" (click)="selected.set(p)">
              <div class="rx-header">
                <div class="rx-id">#{{ p.id }}</div>
                <div class="rx-date">{{ p.timestamp | date:'MMM d, y' }}</div>
              </div>
              <h3>{{ p.disease }}</h3>
              <div class="rx-meta">
                <span class="doctor-name">👨‍⚕️ {{ p.doctorName }}</span>
                <span class="specialty">{{ p.doctorSpecialty }}</span>
              </div>
              <div class="rx-footer">
                @if (p.followUpDate) {
                  <span class="follow-up">Follow-up: {{ p.followUpDate | date:'MMM d' }}</span>
                }
                <span class="view-btn">View Details →</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Detail Modal -->
      @if (selected()) {
        <div class="modal-overlay" (click)="selected.set(null)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Prescription #{{ selected()!.id }}</h3>
              <button (click)="selected.set(null)">✕</button>
            </div>
            <div class="modal-body">
              <div class="badge-row">
                <span class="badge-disease">{{ selected()!.disease }}</span>
                <span class="date-label">{{ selected()!.timestamp | date:'medium' }}</span>
              </div>

              <div class="info-section">
                <h4>Prescribing Doctor</h4>
                <p>{{ selected()!.doctorName }} — {{ selected()!.doctorSpecialty }}</p>
              </div>

              <div class="info-section">
                <h4>💊 Medications</h4>
                <pre>{{ selected()!.medications || 'No medications listed.' }}</pre>
              </div>

              <div class="info-section">
                <h4>📋 Dosage Instructions</h4>
                <pre>{{ selected()!.dosageInstructions || 'No dosage instructions.' }}</pre>
              </div>

              <div class="info-section">
                <h4>📝 Notes</h4>
                <pre>{{ selected()!.notes || 'No notes.' }}</pre>
              </div>

              @if (selected()!.followUpDate) {
                <div class="follow-up-banner">
                  📅 Follow-up appointment: <strong>{{ selected()!.followUpDate | date:'fullDate' }}</strong>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Segoe UI', sans-serif; background: #f0f4f8; min-height: 100vh; }
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .topbar { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .topbar h2 { flex: 1; margin: 0; font-size: 22px; color: #1a2a3a; }
    .back { color: #1976d2; text-decoration: none; font-size: 14px; }
    .loading, .empty-state { text-align: center; padding: 60px; color: #64748b; background: #fff; border-radius: 12px; }
    .empty-state span { font-size: 48px; display: block; margin-bottom: 12px; }
    .empty-state p { font-size: 15px; margin: 0 0 20px; }
    .btn-primary { background: #3949ab; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: none; display: inline-block; }
    .rx-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 16px; }
    .rx-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
    .rx-card:hover { border-color: #3949ab; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(57,73,171,0.12); }
    .rx-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .rx-id { font-size: 11px; color: #94a3b8; font-weight: 600; }
    .rx-date { font-size: 11px; color: #94a3b8; }
    .rx-card h3 { margin: 0 0 10px; font-size: 17px; color: #1a2a3a; }
    .rx-meta { margin-bottom: 14px; }
    .doctor-name { display: block; font-size: 13px; color: #475569; font-weight: 500; }
    .specialty { font-size: 12px; color: #94a3b8; }
    .rx-footer { display: flex; align-items: center; justify-content: space-between; }
    .follow-up { font-size: 11px; color: #f57c00; font-weight: 600; }
    .view-btn { font-size: 12px; color: #3949ab; font-weight: 600; }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1a2a3a; }
    .modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .badge-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .badge-disease { background: #e8eaf6; color: #3949ab; font-weight: 700; padding: 5px 12px; border-radius: 20px; font-size: 14px; }
    .date-label { font-size: 12px; color: #94a3b8; }
    .info-section { margin-bottom: 18px; }
    .info-section h4 { margin: 0 0 8px; font-size: 13px; color: #64748b; font-weight: 600; }
    .info-section p { margin: 0; font-size: 15px; color: #1a2a3a; }
    .info-section pre { margin: 0; font-family: 'Segoe UI', sans-serif; font-size: 14px; color: #334155; background: #f8fafc; border-radius: 8px; padding: 12px; white-space: pre-wrap; }
    .follow-up-banner { background: #fff8e1; border: 1px solid #ffcc02; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #795548; margin-top: 8px; }
  `]
})
export class PatientPrescriptionsComponent implements OnInit {
  prescriptions = signal<any[]>([]);
  loading = signal(true);
  selected = signal<any>(null);

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit() {
    this.prescriptionService.getMyPrescriptions().subscribe({
      next: (data) => { this.prescriptions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
