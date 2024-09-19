import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ParcelaI } from '../models/parcelas';
import { catchError, map } from 'rxjs';
import { handleError } from '../../../core/tools/handle-error';

@Injectable({ providedIn: 'root' })
export class ParcelasService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'parcelas';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: ParcelaI[];
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
    const direction = this.url + 'parcelas/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: ParcelaI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<ParcelaI>) {
    const direction = this.url + 'parcelas';
    return this.http
      .post<{
        ok: boolean;
        result: ParcelaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<ParcelaI>) {
    const direction = this.url + 'parcelas/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: ParcelaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<ParcelaI>) {
    const direction = this.url + 'parcelas/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: ParcelaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<ParcelaI>) {
    const direction = this.url + 'parcelas/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: ParcelaI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
