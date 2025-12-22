import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverURL } from '../../environment/environment';
import { IPage } from '../../model/plist';
import { IReyna } from '../../model/reyna';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReynaService {
  constructor(private oHttp: HttpClient) {}

  getPage(
    page: number,
    rpp: number,
    order: string = '',
    direction: string = ''
  ): Observable<IPage<IReyna>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    return this.oHttp.get<IPage<IReyna>>(
      serverURL + `/frasesmotivacionales?page=${page}&size=${rpp}&sort=${order},${direction}`
    );
  }

  get(id: number): Observable<IReyna> {
    return this.oHttp.get<IReyna>(serverURL + '/frasesmotivacionales/' + id);
  }

  empty(): Observable<number> {
    return this.oHttp.delete<number>(serverURL + '/frasesmotivacionales/empty');
  }

  create(reyna: Partial<IReyna>): Observable<number> {
    return this.oHttp.post<number>(serverURL + '/frasesmotivacionales', reyna);
  }

  update(reyna: Partial<IReyna>): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/frasesmotivacionales', reyna);
  }

  delete(id: number): Observable<number> {
    return this.oHttp.delete<number>(serverURL + '/frasesmotivacionales/' + id);
  }

  count(): Observable<number> {
    return this.oHttp.get<number>(serverURL + '/frasesmotivacionales/count');
  }

  rellenaReyna(numFrases: number): Observable<number> {
    return this.oHttp.get<number>(serverURL + '/frasesmotivacionales/rellena/' + numFrases);
  }

  // togglePublica(reyna: IReyna): Observable<number> {
  //   const updated = { ...reyna, esPublica: !reyna.esPublica };
  //   return this.oHttp.put<number>(serverURL + '/frasesmotivacionales', updated);
  // }
  publicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/frasesmotivacionales/publicar/' + id, {});
  }

  despublicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/frasesmotivacionales/despublicar/' + id, {});
  }
}
