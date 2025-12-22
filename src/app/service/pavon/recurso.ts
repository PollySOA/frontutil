import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverURL } from '../../environment/environment';
import { IRecurso } from '../../model/pavon/recurso';
import { IPage } from '../../model/plist';

@Injectable({
  providedIn: 'root',
})
export class PavonService {
  
  constructor(private oHttp: HttpClient) { }

  getPage(page: number, rpp: number, order: string = '', direction: string = ''): Observable<IPage<IRecurso>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    return this.oHttp.get<IPage<IRecurso>>(serverURL + `/recurso?page=${page}&size=${rpp}&sort=${order},${direction}`);
  }

  get(id: number): Observable<IRecurso> {
    return this.oHttp.get<IRecurso>(serverURL + '/recurso/' + id);
  }

  create(recurso: Partial<IRecurso>): Observable<number> {
    return this.oHttp.post<number>(serverURL + '/recurso', recurso);
  }

  update(recurso: Partial<IRecurso>): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/recurso', recurso);
  }

  delete(id: number): Observable<number> {
    return this.oHttp.delete<number>(serverURL + '/recurso/' + id);
  }

  rellenaRecurso(numPosts: number): Observable<number> {
    return this.oHttp.post<number>(serverURL + '/recurso/generate-fake/' + numPosts, {});
  }

  empty(): Observable<number> {
    return this.oHttp.delete<number>(serverURL + '/recurso/empty');
  }

  publicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/recurso/publicar/' + id, {});
  }

  despublicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/recurso/despublicar/' + id, {});
  }
}
