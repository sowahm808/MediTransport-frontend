import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.hasRole(allowedRoles)) {
      return true;
    } else {
      // Redirect to appropriate dashboard or access denied page
      const user = authService.getCurrentUser();
      if (user) {
        authService.navigateToRoleDashboard();
      } else {
        router.navigate(['/auth/login']);
      }
      return false;
    }
  };
};
