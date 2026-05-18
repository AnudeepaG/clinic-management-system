// src/app/features/patient/appointments/patient-appointments.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <nav class="topbar">
        <a routerLink="/patient/dashboard" class="back">← Dashboard</a>
        <h2>My Appointments</h2>
        <button class="btn-primary" (click)="showBooking.set(true)">+ Book Appointment</button>
      </nav>

      <!-- Appointment list -->
      <div class="appt-grid">
        @for (a of appointments(); track a.id) {
          <div class="appt-card" [class]="'status-' + a.status.toLowerCase()">
            <div class="card-header">
              <span class="status-badge" [class]="'badge-' + a.status.toLowerCase()">{{ a.status }}</span>
              <span class="appt-id">#{{ a.id }}</span>
            </div>
            <h3>{{ a.doctorName }}</h3>
            <p class="specialty">{{ a.doctorSpecialty }}</p>
            <div class="card-detail">
              <span>📅 {{ a.appointmentDate | date:'fullDate' }}</span>
              <span>⏰ {{ a.timeSlot }}</span>
            </div>
            @if (a.status === 'SCHEDULED') {
              <button class="btn-cancel" (click)="cancel(a.id)">Cancel Appointment</button>
            }
          </div>
        }
        @empty {
          <div class="empty-full">
            <div class="empty-icon">📅</div>
            <p>No appointments yet.</p>
            <button class="btn-primary" (click)="showBooking.set(true)">Book Your First Appointment</button>
          </div>
        }
      </div>

      <!-- Booking Modal -->
      @if (showBooking()) {
        <div class="modal-overlay" (click)="closeBooking()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Book an Appointment</h3>
              <button (click)="closeBooking()">✕</button>
            </div>
            <div class="modal-body">
              <!-- Step 1: Doctor + Date -->
              <div class="form-group">
                <label>Select Doctor</label>
                <select [(ngModel)]="booking.doctorId" (ngModelChange)="onDoctorChange()" class="select-input">
                  <option value="">Choose a doctor…</option>
                  @for (d of doctors(); track d.id) {
                    <option [value]="d.id">{{ d.fullName }} — {{ d.specialty }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label>Appointment Date</label>
                <input type="date" [(ngModel)]="booking.date" [min]="today"
                       (ngModelChange)="loadSlots()" class="date-input" />
              </div>

              <!-- Step 2: Slot picker -->
              @if (booking.doctorId && booking.date) {
                <div class="form-group">
                  <label>Available Slots <small>(15-min intervals)</small></label>
                  @if (loadingSlots()) {
                    <div class="slots-loading">Loading slots…</div>
                  } @else {
                    <div class="slot-grid">
                      @for (slot of slots(); track slot.time) {
                        <button class="slot-btn"
                                [class.selected]="booking.timeSlot === slot.time"
                                [class.booked]="!slot.available"
                                [disabled]="!slot.available"
                                (click)="booking.timeSlot = slot.time">
                          {{ slot.time }}
                          @if (!slot.available) { <span class="booked-label">Booked</span> }
                        </button>
                      }
                      @empty {
                        <p class="no-slots">No slots configured for this doctor.</p>
                      }
                    </div>
                  }
                </div>
              }

              <div class="form-group">
                <label>Notes (optional)</label>
                <textarea [(ngModel)]="booking.notes" rows="3" placeholder="Reason for visit…" class="textarea-input"></textarea>
              </div>

              @if (bookingError()) {
                <div class="error-msg">{{ bookingError() }}</div>
              }
              @if (bookingSuccess()) {
                <div class="success-msg">✅ Appointment booked successfully!</div>
              }

              <button class="btn-primary full" (click)="confirmBooking()"
                      [disabled]="!booking.doctorId || !booking.date || !booking.timeSlot || savingBooking()">
                {{ savingBooking() ? 'Booking…' : 'Confirm Booking' }}
              </button>
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
    .topbar h2 { flex: 1; margin: 0; color: #1a2a3a; font-size: 22px; }
    .back { color: #1976d2; text-decoration: none; font-size: 14px; white-space: nowrap; }
    .btn-primary { background: #3949ab; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 14px; cursor: pointer; }
    .appt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
    .appt-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid #e2e8f0; }
    .appt-card.status-scheduled { border-left-color: #1976d2; }
    .appt-card.status-completed { border-left-color: #388e3c; }
    .appt-card.status-cancelled { border-left-color: #c62828; opacity: 0.7; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .status-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; text-transform: uppercase; }
    .badge-scheduled { background: #e3f2fd; color: #1565c0; }
    .badge-completed { background: #e8f5e9; color: #2e7d32; }
    .badge-cancelled { background: #fce4ec; color: #c62828; }
    .badge-no_show { background: #fff8e1; color: #f57c00; }
    .appt-id { font-size: 12px; color: #94a3b8; }
    .appt-card h3 { margin: 0 0 4px; font-size: 16px; color: #1a2a3a; }
    .specialty { margin: 0 0 14px; font-size: 13px; color: #64748b; }
    .card-detail { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #475569; margin-bottom: 14px; }
    .btn-cancel { width: 100%; padding: 8px; background: #fce4ec; border: none; border-radius: 8px; color: #c62828; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-cancel:hover { background: #ef9a9a; color: #fff; }
    .empty-full { grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-full p { color: #64748b; font-size: 16px; margin: 0 0 20px; }
    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1a2a3a; }
    .modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
    .form-group label small { font-weight: 400; color: #94a3b8; }
    .select-input, .date-input, .textarea-input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; background: #fff; }
    .select-input:focus, .date-input:focus { border-color: #3949ab; }
    .textarea-input { resize: vertical; }
    .slot-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
    .slot-btn { padding: 8px 4px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; color: #334155; position: relative; }
    .slot-btn:hover:not(:disabled) { border-color: #3949ab; background: #e8eaf6; color: #3949ab; }
    .slot-btn.selected { background: #3949ab; color: #fff; border-color: #3949ab; }
    .slot-btn.booked { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }
    .booked-label { display: block; font-size: 9px; font-weight: 400; color: #94a3b8; }
    .slots-loading { color: #64748b; font-size: 13px; padding: 16px; text-align: center; }
    .no-slots { color: #94a3b8; font-size: 13px; text-align: center; }
    .error-msg { background: #fce4ec; border-radius: 8px; color: #c62828; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
    .success-msg { background: #e8f5e9; border-radius: 8px; color: #2e7d32; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; }
    .btn-primary.full { width: 100%; padding: 12px; font-size: 15px; border-radius: 10px; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class PatientAppointmentsComponent implements OnInit {
  appointments = signal<any[]>([]);
  doctors = signal<any[]>([]);
  slots = signal<any[]>([]);
  loadingSlots = signal(false);
  savingBooking = signal(false);
  showBooking = signal(false);
  bookingError = signal('');
  bookingSuccess = signal(false);
  today = new Date().toISOString().split('T')[0];

  booking = { doctorId: '', date: '', timeSlot: '', notes: '' };

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.appointmentService.getMyAppointments().subscribe(data => this.appointments.set(data));
    this.doctorService.getAll().subscribe(data => this.doctors.set(data));
  }

  onDoctorChange() {
    this.booking.timeSlot = '';
    this.slots.set([]);
    if (this.booking.doctorId && this.booking.date) this.loadSlots();
  }

  loadSlots() {
    if (!this.booking.doctorId || !this.booking.date) return;
    this.loadingSlots.set(true);
    this.booking.timeSlot = '';
    this.appointmentService.getAvailableSlots(+this.booking.doctorId, this.booking.date).subscribe({
      next: (s) => { this.slots.set(s); this.loadingSlots.set(false); },
      error: () => this.loadingSlots.set(false)
    });
  }

  confirmBooking() {
    this.bookingError.set('');
    this.savingBooking.set(true);
    this.appointmentService.bookAppointment(this.booking).subscribe({
      next: (appt) => {
        this.appointments.update(list => [appt, ...list]);
        this.bookingSuccess.set(true);
        this.savingBooking.set(false);
        setTimeout(() => { this.closeBooking(); }, 1500);
      },
      error: (err) => {
        this.bookingError.set(err.error?.error || 'Booking failed. Try again.');
        this.savingBooking.set(false);
      }
    });
  }

  cancel(id: number) {
    if (!confirm('Cancel this appointment?')) return;
    this.appointmentService.cancel(id).subscribe({
      next: () => this.appointments.update(list =>
        list.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
    });
  }

  closeBooking() {
    this.showBooking.set(false);
    this.bookingSuccess.set(false);
    this.bookingError.set('');
    this.booking = { doctorId: '', date: '', timeSlot: '', notes: '' };
    this.slots.set([]);
  }
}
