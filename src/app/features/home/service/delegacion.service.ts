import { handleError } from '@/app/core';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { DelegacionI } from '../models';

@Injectable({ providedIn: 'root' })
export class DelegacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'delegaciones';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: DelegacionI[];
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
    const direction = this.url + 'delegaciones/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: DelegacionI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<DelegacionI>) {
    const direction = this.url + 'delegaciones';
    return this.http
      .post<{
        ok: boolean;
        result: DelegacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<DelegacionI>) {
    const direction = this.url + 'delegaciones/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: DelegacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<DelegacionI>) {
    const direction = this.url + 'delegaciones/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: DelegacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<DelegacionI>) {
    const direction = this.url + 'delegaciones/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: DelegacionI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
