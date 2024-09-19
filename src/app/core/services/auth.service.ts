import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  firstValueFrom,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginResponse,
  LoginUserDto,
  UsuarioI,
} from '../../features/login/models/usuario';
import { handleError } from '../tools/handle-error';

export const USER_COOKIE_KEY = 'x-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly cookie: CookieService,
    private readonly router: Router
  ) {}

  private url = environment.url;

  /** @description Variable para recuperar la información del usuario */
  private user = new BehaviorSubject<UsuarioI | null>(null);

  login(user: string, pass: string, param?: any) {
    let url = this.url + 'usuarios/auth/login';

    const usuario: LoginUserDto = {
      usuario: user,
      clave: pass,
    };

    return this.http
      .post<{ ok: boolean; result: LoginResponse; msg: string }>(url, usuario)
      .pipe(
        map((data) => data.result),
        tap((userToken) => this.saveTokenToCookie(userToken.token.token)),
        tap((userToken) => this.pushNewUser(userToken.usuario)),
        tap(() => this.redirect(param)),
        catchError((e) => handleError(e))
      );
  }

  /** @description Guarda el token en las cookies */
  private saveTokenToCookie(token: string) {
    this.cookie.set(USER_COOKIE_KEY, token, undefined, '/');
  }

  /** @description Guardamos el usuario en una variable tipo Behavior Subject */
  private pushNewUser(user: UsuarioI) {
    this.user.next(user);
  }

  /** @description Una vez que pasa las autenticaciones, redirigimos al usuario. */
  private redirect(param: any) {
    if (param) this.router.navigate([param]);
    else this.router.navigate(['home']);
  }

  async returnUserInfo() {
    let direction = `${this.url}usuarios/user/info`;
    try {
      const userData = await firstValueFrom(
        this.user.pipe(
          take(1),
          switchMap((data) => {
            if (data == null) {
              return this.http.get<UsuarioI>(direction).pipe(
                tap((userToken) => this.pushNewUser(userToken)),
                catchError((error) => {
                  this.logout();
                  handleError(error);
                  return EMPTY;
                })
              );
            } else return of(data);
          })
        )
      );
      if (userData) return userData;
      else {
        this.logout();
        return null;
      }
    } catch (error) {
      this.logout();
      return null;
    }
  }

  /** @description Todas las funciones para borrar las credenciales del usuario al deslogearse  */
  logout() {
    this.removeUserFromCookie();
    this.user.next(null);
    this.router.navigate(['login'], { replaceUrl: true });
    //window.location.reload();
  }

  private removeUserFromCookie() {
    this.cookie.set(USER_COOKIE_KEY, '', undefined, '/');
  }

  checkToken(token: string) {
    return this.http
      .put(this.url, { token })
      .pipe(catchError((e) => handleError(e)));
  }
}
