// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },

  // Doctor
  {
    path: 'doctor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DOCTOR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/doctor/dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/doctor/appointments/doctor-appointments.component').then(m => m.DoctorAppointmentsComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/doctor/prescriptions/doctor-prescriptions.component').then(m => m.DoctorPrescriptionsComponent)
      }
    ]
  },

  // Patient
  {
    path: 'patient',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/patient/dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/patient/appointments/patient-appointments.component').then(m => m.PatientAppointmentsComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/patient/prescriptions/patient-prescriptions.component').then(m => m.PatientPrescriptionsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
