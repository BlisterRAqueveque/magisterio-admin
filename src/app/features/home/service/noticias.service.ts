import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { environment } from '@/environments/environment';
import { NoticiaI } from '../models';
import { handleError } from '@/app/core';

@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.url;

  //! GET METHOD
  getAll(params?: HttpParams) {
    const direction = this.url + 'noticias';
    return this.http
      .get<{
        ok: boolean;
        result: {
          result: NoticiaI[];
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
    const direction = this.url + 'noticias/entities/deletes';
    return this.http
      .get<{
        ok: boolean;
        result: NoticiaI[];
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! POST METHOD
  save(data: FormData) {
    const direction = this.url + 'noticias';
    return this.http
      .post<{
        ok: boolean;
        result: NoticiaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! PUT METHOD
  update(data: Partial<NoticiaI>) {
    const direction = this.url + 'noticias/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: NoticiaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  restore(data: Partial<NoticiaI>) {
    const direction = this.url + 'noticias/entities/deletes/' + data.id;
    return this.http
      .put<{
        ok: boolean;
        result: NoticiaI;
        msg: string;
      }>(direction, data)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }

  //! DELETE METHOD
  softDelete(data: Partial<NoticiaI>) {
    const direction = this.url + 'noticias/' + data.id;
    return this.http
      .delete<{
        ok: boolean;
        result: NoticiaI;
        msg: string;
      }>(direction)
      .pipe(
        catchError((e) => handleError(e)),
        map((data) => data.result)
      );
  }
}
