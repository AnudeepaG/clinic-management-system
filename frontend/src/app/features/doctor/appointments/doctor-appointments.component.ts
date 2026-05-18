// src/app/features/doctor/appointments/doctor-appointments.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar [links]="navLinks" />
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h2>Appointments</h2>
          <p>Manage your schedule and patient appointments</p>
        </div>
        <button class="btn-outline" (click)="showSlotEditor.set(!showSlotEditor())">
          {{ showSlotEditor() ? 'Hide' : '⚙ Manage' }} Slots
        </button>
      </div>

      <!-- Slot Editor -->
      @if (showSlotEditor()) {
        <div class="slot-editor card">
          <h3>Define Available Slots</h3>
          <p class="hint">Enter comma-separated times (HH:MM format), e.g. 09:00,09:15,09:30</p>
          <textarea [(ngModel)]="slotsText" rows="3" placeholder="09:00,09:15,09:30..."></textarea>
          <button class="btn-primary" (click)="saveSlots()" [disabled]="savingSlots()">
            {{ savingSlots() ? 'Saving…' : 'Save Slots' }}
          </button>
          @if (slotSaveMsg()) { <div class="success-msg">{{ slotSaveMsg() }}</div> }
        </div>
      }

      <!-- Date filter -->
      <div class="filter-bar">
        <div class="filter-group">
          <label>Filter by Date</label>
          <input type="date" [(ngModel)]="selectedDate" (change)="loadAppointments()" />
        </div>
        <div class="status-legend">
          <span class="dot scheduled"></span>Scheduled
          <span class="dot completed"></span>Completed
          <span class="dot cancelled"></span>Cancelled
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="table-card">
        @if (appointments().length === 0) {
          <div class="empty-state">No appointments found for selected date</div>
        } @else {
          <table>
            <thead>
              <tr><th>Time</th><th>Patient</th><th>Date</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (a of appointments(); track a.id) {
                <tr>
                  <td class="time-cell">{{ a.timeSlot }}</td>
                  <td>{{ a.patientName }}</td>
                  <td>{{ a.appointmentDate }}</td>
                  <td><span class="status-badge" [class]="a.status.toLowerCase()">{{ a.status }}</span></td>
                  <td class="notes-cell">{{ a.notes || '—' }}</td>
                  <td>
                    <div class="action-btns">
                      @if (a.status === 'SCHEDULED') {
                        <button class="btn-sm green" (click)="updateStatus(a, 'COMPLETED')">Complete</button>
                        <button class="btn-sm red" (click)="updateStatus(a, 'NO_SHOW')">No Show</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px 32px; background: #0f172a; min-height: calc(100vh - 60px); color: #e2e8f0; font-family: 'Segoe UI', sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h2 { color: #f1f5f9; font-size: 24px; margin: 0 0 4px; }
    .page-header p { color: #64748b; margin: 0; font-size: 14px; }
    .btn-primary { padding: 9px 20px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-outline { padding: 9px 20px; border: 1px solid #334155; color: #94a3b8; border-radius: 8px; background: transparent; cursor: pointer; font-size: 14px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; margin-bottom: 20px; }
    .slot-editor h3 { color: #f1f5f9; margin: 0 0 8px; font-size: 16px; }
    .hint { color: #64748b; font-size: 12px; margin-bottom: 12px; }
    .slot-editor textarea { width: 100%; padding: 10px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 13px; box-sizing: border-box; margin-bottom: 12px; resize: none; }
    .success-msg { color: #86efac; font-size: 13px; margin-top: 8px; }
    .filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .filter-group { display: flex; align-items: center; gap: 10px; }
    .filter-group label { color: #94a3b8; font-size: 13px; }
    .filter-group input { padding: 8px 12px; background: #1e293b; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 13px; }
    .status-legend { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #94a3b8; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
    .dot.scheduled { background: #3b82f6; }
    .dot.completed { background: #22c55e; }
    .dot.cancelled { background: #ef4444; }
    .table-card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
    .empty-state { color: #475569; text-align: center; padding: 40px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: #0f172a; }
    th { padding: 12px 16px; text-align: left; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    td { padding: 12px 16px; color: #cbd5e1; font-size: 14px; border-top: 1px solid #1e293b; }
    .time-cell { color: #38bdf8; font-weight: 600; }
    .notes-cell { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status-badge { padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .status-badge.scheduled { background: #1d4ed8; color: #bfdbfe; }
    .status-badge.completed { background: #14532d; color: #86efac; }
    .status-badge.cancelled, .status-badge.no_show { background: #450a0a; color: #fca5a5; }
    .action-btns { display: flex; gap: 8px; }
    .btn-sm { padding: 4px 10px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; }
    .btn-sm.green { background: #14532d; color: #86efac; }
    .btn-sm.red { background: #450a0a; color: #fca5a5; }
  `]
})
export class DoctorAppointmentsComponent implements OnInit {
  navLinks = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: '📊' },
    { label: 'Appointments', path: '/doctor/appointments', icon: '📅' },
    { label: 'Prescriptions', path: '/doctor/prescriptions', icon: '📋' }
  ];
  profile: any = null;
  appointments = signal<any[]>([]);
  selectedDate = new Date().toISOString().split('T')[0];
  showSlotEditor = signal(false);
  slotsText = signal('');
  savingSlots = signal(false);
  slotSaveMsg = signal('');

  constructor(private appointmentService: AppointmentService, private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.doctorService.getMyProfile().subscribe(p => {
      this.profile = p;
      this.slotsText.set(p.availableSlots || '');
      this.loadAppointments();
    });
  }

  loadAppointments(): void {
    if (this.profile) {
      this.appointmentService.getDoctorAppointments(this.profile.id, this.selectedDate)
        .subscribe(a => this.appointments.set(a));
    }
  }

  saveSlots(): void {
    this.savingSlots.set(true);
    this.doctorService.updateSlots(this.profile.id, this.slotsText()).subscribe({
      next: () => { this.savingSlots.set(false); this.slotSaveMsg.set('Slots saved successfully!'); setTimeout(() => this.slotSaveMsg.set(''), 3000); },
      error: () => { this.savingSlots.set(false); }
    });
  }

  updateStatus(appt: any, status: string): void {
    this.appointmentService.updateStatus(appt.id, status).subscribe(() => this.loadAppointments());
  }
}
