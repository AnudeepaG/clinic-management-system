// src/app/features/doctor/prescriptions/doctor-prescriptions.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PrescriptionService } from '../../../core/services/prescription.service';
import { PatientService } from '../../../core/services/patient.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <nav class="topbar">
        <a routerLink="/doctor/dashboard" class="back">← Dashboard</a>
        <h2>Prescriptions</h2>
        <button class="btn-primary" (click)="showCreateModal.set(true)">+ New Prescription</button>
      </nav>

      <div class="filters">
        <input [(ngModel)]="search" placeholder="Search by patient, disease, doctor…" class="search-input" />
        <select [(ngModel)]="filterType" class="select-filter">
          <option value="all">All Prescriptions</option>
          <option value="mine">My Prescriptions</option>
        </select>
      </div>

      <div class="table-wrap">
        @if (loading()) {
          <div class="loading">Loading prescriptions…</div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>#</th><th>Patient</th><th>Doctor</th><th>Disease</th>
                <th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredPrescriptions(); track p.id) {
                <tr>
                  <td>{{ p.id }}</td>
                  <td><strong>{{ p.patientName }}</strong></td>
                  <td>
                    {{ p.doctorName }}
                    @if (p.editableByDoctorId === myDoctorId()) {
                      <span class="badge-mine">mine</span>
                    }
                  </td>
                  <td>{{ p.disease }}</td>
                  <td>{{ p.timestamp | date:'MMM d, y' }}</td>
                  <td class="actions">
                    <button class="btn-sm view" (click)="viewPrescription(p)">View</button>
                    @if (p.editableByDoctorId === myDoctorId()) {
                      <button class="btn-sm edit" (click)="editPrescription(p)">Edit</button>
                      <button class="btn-sm del" (click)="deletePrescription(p.id)">Delete</button>
                    }
                  </td>
                </tr>
              }
              @empty {
                <tr><td colspan="6" class="empty">No prescriptions found.</td></tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- View/Edit Modal -->
      @if (selectedPrescription()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ editMode() ? 'Edit Prescription' : 'Prescription Details' }}</h3>
              <button (click)="closeModal()">✕</button>
            </div>
            <div class="modal-body">
              <div class="detail-row"><span>Patient</span><strong>{{ selectedPrescription()!.patientName }}</strong></div>
              <div class="detail-row"><span>Doctor</span><strong>{{ selectedPrescription()!.doctorName }}</strong></div>
              <div class="detail-row"><span>Date</span><strong>{{ selectedPrescription()!.timestamp | date:'medium' }}</strong></div>

              @if (editMode()) {
                <div class="form-group">
                  <label>Disease / Diagnosis</label>
                  <input [(ngModel)]="editData.disease" />
                </div>
                <div class="form-group">
                  <label>Medications</label>
                  <textarea [(ngModel)]="editData.medications" rows="4"></textarea>
                </div>
                <div class="form-group">
                  <label>Dosage Instructions</label>
                  <textarea [(ngModel)]="editData.dosageInstructions" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>Notes</label>
                  <textarea [(ngModel)]="editData.notes" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                  <button class="btn-primary" (click)="saveEdit()">Save Changes</button>
                  <button class="btn-secondary" (click)="editMode.set(false)">Cancel</button>
                </div>
              } @else {
                <div class="detail-row"><span>Disease</span><strong>{{ selectedPrescription()!.disease }}</strong></div>
                <div class="detail-row full"><span>Medications</span><p>{{ selectedPrescription()!.medications || '—' }}</p></div>
                <div class="detail-row full"><span>Dosage</span><p>{{ selectedPrescription()!.dosageInstructions || '—' }}</p></div>
                <div class="detail-row full"><span>Notes</span><p>{{ selectedPrescription()!.notes || '—' }}</p></div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="showCreateModal.set(false)">
          <div class="modal wide" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>New Prescription</h3>
              <button (click)="showCreateModal.set(false)">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Patient</label>
                <select [(ngModel)]="newRx.patientId" class="select-filter">
                  <option value="">Select patient…</option>
                  @for (p of patients(); track p.id) {
                    <option [value]="p.id">{{ p.fullName }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Disease / Diagnosis *</label>
                <input [(ngModel)]="newRx.disease" placeholder="e.g. Hypertension" />
              </div>
              <div class="form-group">
                <label>Medications</label>
                <textarea [(ngModel)]="newRx.medications" rows="4" placeholder="List medications…"></textarea>
              </div>
              <div class="form-group">
                <label>Dosage Instructions</label>
                <textarea [(ngModel)]="newRx.dosageInstructions" rows="3"></textarea>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea [(ngModel)]="newRx.notes" rows="3"></textarea>
              </div>
              @if (createError()) {
                <div class="error-msg">{{ createError() }}</div>
              }
              <div class="modal-actions">
                <button class="btn-primary" (click)="createPrescription()" [disabled]="saving()">
                  {{ saving() ? 'Saving…' : 'Create Prescription' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Segoe UI', sans-serif; background: #f0f4f8; min-height: 100vh; }
    .page { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .topbar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .topbar h2 { flex: 1; margin: 0; color: #1a2a3a; font-size: 22px; }
    .back { color: #1976d2; text-decoration: none; font-size: 14px; white-space: nowrap; }
    .btn-primary { background: #1976d2; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; cursor: pointer; font-weight: 600; font-size: 14px; }
    .filters { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
    .select-filter { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; background: #fff; cursor: pointer; }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 14px 16px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    .badge-mine { background: #e3f2fd; color: #1565c0; font-size: 10px; padding: 2px 6px; border-radius: 10px; margin-left: 6px; font-weight: 600; }
    .actions { display: flex; gap: 6px; }
    .btn-sm { padding: 5px 10px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500; }
    .btn-sm.view { background: #e3f2fd; color: #1565c0; }
    .btn-sm.edit { background: #e8f5e9; color: #2e7d32; }
    .btn-sm.del  { background: #fce4ec; color: #c62828; }
    .empty { text-align: center; color: #94a3b8; padding: 40px; }
    .loading { padding: 40px; text-align: center; color: #64748b; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: #fff; border-radius: 16px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
    .modal.wide { max-width: 680px; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1a2a3a; }
    .modal-header button { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }
    .modal-body { padding: 24px; }
    .detail-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; font-size: 14px; }
    .detail-row span { color: #64748b; min-width: 100px; }
    .detail-row strong { color: #1a2a3a; }
    .detail-row.full { flex-direction: column; gap: 6px; }
    .detail-row.full p { margin: 0; color: #334155; background: #f8fafc; border-radius: 8px; padding: 10px; white-space: pre-wrap; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; resize: vertical; }
    .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: none; border-radius: 8px; padding: 10px 18px; cursor: pointer; font-weight: 600; font-size: 14px; }
    .error-msg { background: #fce4ec; border-radius: 8px; color: #c62828; padding: 10px 14px; font-size: 13px; margin-bottom: 12px; }
  `]
})
export class DoctorPrescriptionsComponent implements OnInit {
  prescriptions = signal<any[]>([]);
  patients = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  search = '';
  filterType = 'all';
  selectedPrescription = signal<any>(null);
  editMode = signal(false);
  showCreateModal = signal(false);
  createError = signal('');
  myDoctorId = signal<number | null>(null);

  editData: any = {};
  newRx: any = { patientId: '', disease: '', medications: '', dosageInstructions: '', notes: '' };

  constructor(
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.myDoctorId.set(this.authService.currentUser()?.profileId ?? null);
    this.loadPrescriptions();
    this.patientService.getAll().subscribe(p => this.patients.set(p));
  }

  loadPrescriptions() {
    this.loading.set(true);
    this.prescriptionService.getAllPrescriptions().subscribe({
      next: (data) => { this.prescriptions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  filteredPrescriptions() {
    let list = this.prescriptions();
    if (this.filterType === 'mine') list = list.filter(p => p.editableByDoctorId === this.myDoctorId());
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      list = list.filter(p =>
        p.patientName?.toLowerCase().includes(q) ||
        p.doctorName?.toLowerCase().includes(q) ||
        p.disease?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  viewPrescription(p: any) {
    this.selectedPrescription.set(p);
    this.editMode.set(false);
  }

  editPrescription(p: any) {
    this.selectedPrescription.set(p);
    this.editData = { disease: p.disease, medications: p.medications, dosageInstructions: p.dosageInstructions, notes: p.notes };
    this.editMode.set(true);
  }

  saveEdit() {
    const p = this.selectedPrescription();
    if (!p) return;
    this.prescriptionService.update(p.id, this.editData).subscribe({
      next: (updated) => {
        this.prescriptions.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.selectedPrescription.set(updated);
        this.editMode.set(false);
      }
    });
  }

  deletePrescription(id: number) {
    if (!confirm('Delete this prescription?')) return;
    this.prescriptionService.delete(id).subscribe({
      next: () => this.prescriptions.update(list => list.filter(p => p.id !== id))
    });
  }

  createPrescription() {
    if (!this.newRx.patientId || !this.newRx.disease) {
      this.createError.set('Patient and disease are required.'); return;
    }
    this.saving.set(true);
    this.prescriptionService.create(this.newRx).subscribe({
      next: (rx) => {
        this.prescriptions.update(list => [rx, ...list]);
        this.showCreateModal.set(false);
        this.saving.set(false);
        this.newRx = { patientId: '', disease: '', medications: '', dosageInstructions: '', notes: '' };
      },
      error: (err) => { this.createError.set(err.error?.error || 'Failed to create'); this.saving.set(false); }
    });
  }

  closeModal() {
    this.selectedPrescription.set(null);
    this.editMode.set(false);
  }
}
