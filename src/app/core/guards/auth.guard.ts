import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authLoginGuard: CanActivateFn = async (route, state) => {
  const cookie = inject(CookieService);
  const router = inject(Router);
  const auth = inject(AuthService);

  const token = cookie.getAll()['x-token']
    ? cookie.getAll()['x-token']
    : route.queryParamMap.get('token');

  try {
    const ok = await firstValueFrom(auth.checkToken(token!));
    if (ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    router.navigate(['login']);
    return false;
  }
};
