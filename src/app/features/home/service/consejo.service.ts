import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, map } from 'rxjs';
import { handleError } from '../../../core/tools/handle-error';
import { ConsejoDirectivoI } from '../models';

@Injectable({ providedIn: 'root' })
export class ConsejoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'consejo-directivo';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: ConsejoDirectivoI[];
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
    const direction = this.url + 'consejo-directivo/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: ConsejoDirectivoI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<ConsejoDirectivoI>) {
    const direction = this.url + 'consejo-directivo';
    return this.http
      .post<{
        ok: boolean;
        result: ConsejoDirectivoI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<ConsejoDirectivoI>) {
    const direction = this.url + 'consejo-directivo/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: ConsejoDirectivoI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<ConsejoDirectivoI>) {
    const direction =
      this.url + 'consejo-directivo/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: ConsejoDirectivoI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<ConsejoDirectivoI>) {
    const direction = this.url + 'consejo-directivo/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: ConsejoDirectivoI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
