import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HabitacionI } from '../models/habitaciones';
import { catchError, map } from 'rxjs';
import { handleError } from '../../../core/tools';

@Injectable({ providedIn: 'root' })
export class HabitacionesService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'habitaciones';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: HabitacionI[];
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
    const direction = this.url + 'habitaciones/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: HabitacionI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<HabitacionI>) {
    const direction = this.url + 'habitaciones';
    return this.http
      .post<{
        ok: boolean;
        result: HabitacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<HabitacionI>) {
    const direction = this.url + 'habitaciones/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: HabitacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<HabitacionI>) {
    const direction = this.url + 'habitaciones/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: HabitacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<HabitacionI>) {
    const direction = this.url + 'habitaciones/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: HabitacionI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
