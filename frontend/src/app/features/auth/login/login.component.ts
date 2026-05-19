// src/app/features/auth/login/login.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo">
          <span class="logo-icon">⚕</span>
          <h1>ClinicHub</h1>
          <p>Doctor-Patient Management</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="field">
            <label>Username</label>
            <input type="text" [(ngModel)]="username" name="username"
                   placeholder="Enter your username" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password"
                   placeholder="Enter your password" required />
          </div>

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <p class="register-link">
          New patient? <a routerLink="/register">Register here</a>
        </p>

      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
      font-family: 'Segoe UI', sans-serif;
    }
    .login-card {
      background: #1e293b; border-radius: 16px; padding: 48px 40px;
      width: 100%; max-width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      border: 1px solid #334155;
    }
    .logo { text-align: center; margin-bottom: 36px; }
    .logo-icon { font-size: 48px; }
    .logo h1 { color: #38bdf8; margin: 8px 0 4px; font-size: 28px; font-weight: 700; letter-spacing: 1px; }
    .logo p { color: #64748b; font-size: 13px; margin: 0; }
    .field { margin-bottom: 20px; }
    .field label { display: block; color: #94a3b8; font-size: 13px; margin-bottom: 6px; font-weight: 500; }
    .field input {
      width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #334155;
      border-radius: 8px; color: #e2e8f0; font-size: 14px; box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .field input:focus { outline: none; border-color: #38bdf8; }
    .error-msg { background: #450a0a; color: #fca5a5; padding: 10px 14px; border-radius: 8px;
      font-size: 13px; margin-bottom: 16px; border: 1px solid #7f1d1d; }
    .btn-primary {
      width: 100%; padding: 13px; background: linear-gradient(135deg, #0ea5e9, #2563eb);
      color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .register-link { text-align: center; color: #64748b; font-size: 14px; margin-top: 20px; }
    .register-link a { color: #38bdf8; text-decoration: none; }
    .demo-creds {
      margin-top: 28px; padding: 16px; background: #0f172a; border-radius: 8px;
      border: 1px solid #1e3a5f;
    }
    .demo-creds p { color: #94a3b8; font-size: 12px; margin: 0 0 10px; }
    .cred-row { color: #cbd5e1; font-size: 12px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge.admin { background: #7c3aed; color: white; }
    .badge.doctor { background: #0369a1; color: white; }
    .badge.patient { background: #047857; color: white; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.error.set('Please enter username and password');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        this.loading.set(false);
        switch (user.role) {
          case 'ADMIN':   this.router.navigate(['/admin']); break;
          case 'DOCTOR':  this.router.navigate(['/doctor/dashboard']); break;
          case 'PATIENT': this.router.navigate(['/patient/dashboard']); break;
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error || 'Login failed. Please try again.');
      }
    });
  }
}
