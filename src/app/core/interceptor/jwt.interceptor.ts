import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const cookie = inject(CookieService);
  const router = inject(Router);
  const auth = inject(AuthService);

  const token = cookie.getAll()['x-token'];

  if (token) {
    req = req.clone({
      setHeaders: {
        //? Send to the headers in all request
        authorization: `Bearer ${token}`,
      },
    });
  }
  //! And send to the server
  return next(req).pipe(
    catchError((e) => {
      const CODES = [401, 403];
      const response = e.error;
      if (
        CODES.includes(e.status) &&
        (response
          ? response.message !== 'Not found' &&
            response.message !== 'Wrong credentials' &&
            response.message !== 'Server error'
          : true)
      ) {
        auth.logout();
      }
      return throwError(() => e);
    })
  );
};
