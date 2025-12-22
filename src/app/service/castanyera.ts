import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
import { ICastanyera } from '../model/castanyera';
import { Observable, catchError, tap, throwError, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CastanyeraService {
  constructor(private oHttp: HttpClient) {}

  private toCamel(s: string): string {
    return s.replace(/_([a-z])/g, (_m, c) => c.toUpperCase());
  }

  getPage(
    page: number,
    rpp: number,
    order: string = '',
    direction: string = ''
  ): Observable<IPage<ICastanyera>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    const orderParam = order;
    const url = serverURL + `/castanyera?page=${page}&size=${rpp}&sort=${orderParam},${direction}`;
    return this.oHttp.get<IPage<any>>(url).pipe(
      map((page) => ({
        ...page,
        content: (page.content || []).map((c: any) => ({
          ...c,
          publico: c.publico ?? c.publico ?? false,
          fecha_creacion: c.fecha_creacion ?? c.fechaCreacion ?? null,
          fecha_modificacion: c.fecha_modificacion ?? c.fechaModificacion ?? null,
        })),
      }))
    );
  }

  get(id: number): Observable<ICastanyera> {
    return this.oHttp.get<any>(serverURL + '/castanyera/' + id).pipe(
      map((c: any) => ({
        ...c,
        publico: c.publico ?? c.publico ?? false,
        fecha_creacion: c.fecha_creacion ?? c.fechaCreacion ?? null,
        fecha_modificacion: c.fecha_modificacion ?? c.fechaModificacion ?? null,
      }))
    );
  }

  /**
   * Try to fetch a single castanyera only if it's public.
   * Backend should honor the `publico=true` query param and return 404/403 if not public.
   */
  getIfPublic(id: number): Observable<ICastanyera> {
    return this.oHttp.get<any>(serverURL + '/castanyera/' + id + '?publico=true').pipe(
      map((c: any) => ({
        ...c,
        publico: c.publico ?? c.publico ?? false,
        fecha_creacion: c.fecha_creacion ?? c.fechaCreacion ?? null,
        fecha_modificacion: c.fecha_modificacion ?? c.fechaModificacion ?? null,
      })),
      tap((resp) => console.debug('Castanyera.getIfPublic response:', resp)),
      catchError((err) => {
        console.error('Castanyera.getIfPublic error:', err);
        return throwError(() => err);
      })
    );
  }

  create(castanyera: Partial<ICastanyera>): Observable<number> {
    return this.oHttp.post<number>(serverURL + '/castanyera', castanyera).pipe(
      tap((resp) => console.debug('Castanyera.create response:', resp)),
      catchError((err) => {
        console.error('Castanyera.create error:', err);
        return throwError(() => err);
      })
    );
  }

  update(castanyera: Partial<ICastanyera>): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/castanyera', castanyera);
  }

  delete(id: number): Observable<number> {
    return this.oHttp.delete<number>(serverURL + '/castanyera/' + id);
  }

  rellenaCastanyera(numPosts: number): Observable<number> {
    return this.oHttp.get<number>(serverURL + '/castanyera/rellena/' + numPosts).pipe(
      tap((resp) => console.debug('Castanyera.rellenaCastanyera response:', resp)),
      catchError((err) => {
        console.error('Castanyera.rellenaCastanyera error:', err);
        return throwError(() => err);
      })
    );
  }

  publicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/castanyera/publicar/' + id, {});
  }

  despublicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/castanyera/despublicar/' + id, {});
  }

  getPublicPage(
    page: number,
    rpp: number,
    order: string = '',
    direction: string = ''
  ): Observable<IPage<ICastanyera>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    const orderParam = order;
    const url =
      serverURL +
      `/castanyera?page=${page}&size=${rpp}&sort=${orderParam},${direction}&publico=true`;
    return this.oHttp.get<IPage<any>>(url).pipe(
      map((page) => ({
        ...page,
        content: (page.content || []).map((c: any) => ({
          ...c,
          publico: c.publico ?? c.publico ?? false,
          fecha_creacion: c.fecha_creacion ?? c.fechaCreacion ?? null,
          fecha_modificacion: c.fecha_modificacion ?? c.fechaModificacion ?? null,
        })),
      })),
      tap((resp) => console.debug('Castanyera.getPublicPage response:', resp)),
      catchError((err) => {
        console.error('Castanyera.getPublicPage error:', err);
        return throwError(() => err);
      })
    );
  }

  countPublic(): Observable<number> {
    return this.oHttp.get<number>(serverURL + '/castanyera/countPublic').pipe(
      tap((resp) => console.debug('Castanyera.countPublic response:', resp)),
      catchError((err) => {
        console.error('Castanyera.countPublic error:', err);
        return throwError(() => err);
      })
    );
  }
}
