// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] ?? [];
  const userRole = authService.currentUser()?.role;

  if (userRole && allowedRoles.includes(userRole)) return true;

  // Redirect to appropriate dashboard
  switch (userRole) {
    case 'ADMIN':    router.navigate(['/admin']); break;
    case 'DOCTOR':   router.navigate(['/doctor/dashboard']); break;
    case 'PATIENT':  router.navigate(['/patient/dashboard']); break;
    default:         router.navigate(['/login']);
  }
  return false;
};
