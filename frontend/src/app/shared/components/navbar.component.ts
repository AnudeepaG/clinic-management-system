// src/app/shared/components/navbar.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface NavLink { label: string; path: string; icon: string; }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <span class="logo-icon">⚕</span>
        <span class="logo-text">ClinicOS</span>
        <span class="role-badge" [class]="roleClass()">{{ auth.currentUser()?.role }}</span>
      </div>
      <div class="nav-links">
        @for (link of links(); track link.path) {
          <a [routerLink]="link.path" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">{{ link.icon }}</span>{{ link.label }}
          </a>
        }
      </div>
      <div class="nav-user">
        <span class="username">{{ auth.currentUser()?.username }}</span>
        <button class="logout-btn" (click)="auth.logout()">Sign Out</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; padding: 0 24px; height: 60px;
      background: #1e293b; border-bottom: 1px solid #334155;
      position: sticky; top: 0; z-index: 100;
    }
    .nav-brand { display: flex; align-items: center; gap: 8px; min-width: 200px; }
    .logo-icon { font-size: 22px; }
    .logo-text { color: #38bdf8; font-weight: 700; font-size: 18px; letter-spacing: 0.5px; }
    .role-badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .role-badge.admin-badge { background: #7c3aed; color: white; }
    .role-badge.doctor-badge { background: #0369a1; color: white; }
    .role-badge.patient-badge { background: #047857; color: white; }
    .nav-links { display: flex; gap: 4px; flex: 1; justify-content: center; }
    .nav-link {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      color: #94a3b8; text-decoration: none; border-radius: 8px;
      font-size: 14px; transition: all 0.15s;
    }
    .nav-link:hover { color: #e2e8f0; background: #334155; }
    .nav-link.active { color: #38bdf8; background: rgba(56,189,248,0.1); }
    .nav-icon { font-size: 16px; }
    .nav-user { display: flex; align-items: center; gap: 12px; min-width: 200px; justify-content: flex-end; }
    .username { color: #64748b; font-size: 13px; }
    .logout-btn {
      padding: 6px 14px; background: transparent; border: 1px solid #334155;
      color: #94a3b8; border-radius: 6px; font-size: 13px; cursor: pointer;
    }
    .logout-btn:hover { border-color: #ef4444; color: #ef4444; }
  `]
})
export class NavbarComponent {
  links = input<NavLink[]>([]);
  constructor(public auth: AuthService) {}

  roleClass(): string {
    const role = this.auth.currentUser()?.role?.toLowerCase();
    return role ? `${role}-badge` : '';
  }
}
