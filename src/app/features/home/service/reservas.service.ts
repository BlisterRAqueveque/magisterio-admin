import { handleError } from '@/app/core';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { ReservaI } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'reservas';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: ReservaI[];
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
    const direction = this.url + 'reservas/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: ReservaI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<ReservaI>) {
    const direction = this.url + 'reservas';
    return this.http
      .post<{
        ok: boolean;
        result: ReservaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<ReservaI>) {
    const direction = this.url + 'reservas/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: ReservaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<ReservaI>) {
    const direction = this.url + 'reservas/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: ReservaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<ReservaI>) {
    const direction = this.url + 'reservas/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: ReservaI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
