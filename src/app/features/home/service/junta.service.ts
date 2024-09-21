import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { environment } from '@/environments/environment';
import { JuntaFiscalizacionI } from '../models';
import { handleError } from '@/app/core';

@Injectable({ providedIn: 'root' })
export class JuntaService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'junta-fiscalizaciones';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: JuntaFiscalizacionI[];
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
    const direction = this.url + 'junta-fiscalizaciones/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: JuntaFiscalizacionI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<JuntaFiscalizacionI>) {
    const direction = this.url + 'junta-fiscalizaciones';
    return this.http
      .post<{
        ok: boolean;
        result: JuntaFiscalizacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<JuntaFiscalizacionI>) {
    const direction = this.url + 'junta-fiscalizaciones/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: JuntaFiscalizacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<JuntaFiscalizacionI>) {
    const direction =
      this.url + 'junta-fiscalizaciones/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: JuntaFiscalizacionI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<JuntaFiscalizacionI>) {
    const direction = this.url + 'junta-fiscalizaciones/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: JuntaFiscalizacionI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
