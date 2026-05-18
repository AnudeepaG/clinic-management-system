// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-card">
        <div class="logo">
          <span class="logo-icon">⚕</span>
          <h1>ClinicOS</h1>
          <p>Patient Registration</p>
        </div>

        @if (!success()) {
          <form (ngSubmit)="onRegister()" class="register-form">
            <div class="row-2">
              <div class="field">
                <label>Username *</label>
                <input type="text" [(ngModel)]="form.username" name="username" placeholder="Username" required />
              </div>
              <div class="field">
                <label>Email *</label>
                <input type="email" [(ngModel)]="form.email" name="email" placeholder="Email" required />
              </div>
            </div>
            <div class="row-2">
              <div class="field">
                <label>Password *</label>
                <input type="password" [(ngModel)]="form.password" name="password" placeholder="Password" required />
              </div>
              <div class="field">
                <label>Full Name *</label>
                <input type="text" [(ngModel)]="form.fullName" name="fullName" placeholder="Full name" required />
              </div>
            </div>
            <div class="row-2">
              <div class="field">
                <label>Date of Birth</label>
                <input type="date" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" />
              </div>
              <div class="field">
                <label>Gender</label>
                <select [(ngModel)]="form.gender" name="gender">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div class="row-2">
              <div class="field">
                <label>Phone</label>
                <input type="tel" [(ngModel)]="form.phone" name="phone" placeholder="Phone number" />
              </div>
              <div class="field">
                <label>Blood Group</label>
                <select [(ngModel)]="form.bloodGroup" name="bloodGroup">
                  <option value="">Select</option>
                  <option *ngFor="let bg of bloodGroups" [value]="bg">{{ bg }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Address</label>
              <textarea [(ngModel)]="form.address" name="address" placeholder="Home address" rows="2"></textarea>
            </div>

            @if (error()) {
              <div class="error-msg">{{ error() }}</div>
            }

            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Registering…' : 'Create Account' }}
            </button>
          </form>
        } @else {
          <div class="success-block">
            <div class="success-icon">✓</div>
            <h3>Registration Successful!</h3>
            <p>Your patient account has been created.</p>
            <a routerLink="/login" class="btn-primary">Go to Login</a>
          </div>
        }

        <p class="login-link">Already have an account? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      font-family: 'Segoe UI', sans-serif; padding: 20px;
    }
    .register-card {
      background: #1e293b; border-radius: 16px; padding: 40px;
      width: 100%; max-width: 560px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      border: 1px solid #334155;
    }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-icon { font-size: 36px; }
    .logo h1 { color: #38bdf8; margin: 6px 0 4px; font-size: 24px; font-weight: 700; }
    .logo p { color: #64748b; font-size: 13px; margin: 0; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; color: #94a3b8; font-size: 12px; margin-bottom: 5px; font-weight: 500; }
    .field input, .field select, .field textarea {
      width: 100%; padding: 10px 12px; background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; color: #e2e8f0; font-size: 13px; box-sizing: border-box;
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none; border-color: #38bdf8;
    }
    .field select option { background: #1e293b; }
    .field textarea { resize: none; }
    .error-msg { background: #450a0a; color: #fca5a5; padding: 10px 14px; border-radius: 8px;
      font-size: 13px; margin-bottom: 14px; }
    .btn-primary {
      width: 100%; padding: 12px; background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600;
      cursor: pointer; text-decoration: none; display: block; text-align: center;
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .login-link { text-align: center; color: #64748b; font-size: 13px; margin-top: 16px; }
    .login-link a { color: #38bdf8; text-decoration: none; }
    .success-block { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 48px; color: #22c55e; background: #052e16;
      width: 80px; height: 80px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; margin: 0 auto 16px; }
    .success-block h3 { color: #22c55e; margin: 0 0 8px; }
    .success-block p { color: #94a3b8; margin: 0 0 20px; }
  `]
})
export class RegisterComponent {
  form = {
    username: '', email: '', password: '', fullName: '',
    dateOfBirth: '', gender: '', phone: '', bloodGroup: '', address: ''
  };
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private authService: AuthService) {}

  onRegister(): void {
    if (!this.form.username || !this.form.email || !this.form.password || !this.form.fullName) {
      this.error.set('Please fill in all required fields');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.authService.registerPatient(this.form).subscribe({
      next: () => { this.loading.set(false); this.success.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Registration failed');
      }
    });
  }
}
