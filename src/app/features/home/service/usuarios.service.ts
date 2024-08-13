import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { handleError } from '../../../core/tools';
import { UsuarioI } from '../../login/models/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  getAllUsers(params: HttpParams) {
    const direction = this.url + 'usuarios';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: UsuarioI[];
          count: number;
        };
        msg: string;
      }>(direction, { params })
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
  getDeletes() {
    const direction = this.url + 'usuarios/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: UsuarioI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<UsuarioI>) {
    const direction = this.url + 'usuarios';
    return this.http
      .post<{
        ok: boolean;
        result: UsuarioI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<UsuarioI>) {
    const direction = this.url + 'usuarios/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: UsuarioI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<UsuarioI>) {
    const direction = this.url + 'usuarios/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: UsuarioI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<UsuarioI>) {
    const direction = this.url + 'usuarios/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: UsuarioI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
