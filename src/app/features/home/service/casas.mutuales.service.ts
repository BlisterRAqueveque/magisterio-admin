import { handleError } from '@/app/core';
import { environment } from '@/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { CasaMutualI } from '../models';

@Injectable({ providedIn: 'root' })
export class CasasMutualesService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'casas-mutuales';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: CasaMutualI[];
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
    const direction = this.url + 'casas-mutuales/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: CasaMutualI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: Partial<CasaMutualI>) {
    const direction = this.url + 'casas-mutuales';
    return this.http
      .post<{
        ok: boolean;
        result: CasaMutualI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<CasaMutualI>) {
    const direction = this.url + 'casas-mutuales/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: CasaMutualI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<CasaMutualI>) {
    const direction = this.url + 'casas-mutuales/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: CasaMutualI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<CasaMutualI>) {
    const direction = this.url + 'casas-mutuales/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: CasaMutualI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
