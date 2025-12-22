import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPage } from '../../model/plist';
import { Observable } from 'rxjs';
import { IGarcia } from '../../model/garcia/garcia';

@Injectable({
  providedIn: 'root'
})
export class GarciaService {
  private url = 'http://localhost:8089/garcia';

  constructor(private http: HttpClient) { }

  getPage(page: number, rpp: number, order: string = '', direction: string = ''): Observable<IPage<IGarcia>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    return this.http.get<IPage<IGarcia>>(`${this.url}?page=${page}&size=${rpp}&sort=${order},${direction}`);
  }

  get(id: number): Observable<IGarcia> {
    return this.http.get<IGarcia>(`${this.url}/${id}`);
  }

  create(garcia: Partial<IGarcia>): Observable<number> {
    return this.http.post<number>(this.url, garcia);
  }

  update(garcia: Partial<IGarcia>): Observable<number> {
    return this.http.put<number>(this.url, garcia);
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(`${this.url}/${id}`);
  }

  rellenaBlog(numPosts: number): Observable<number> {
    return this.http.get<number>(`${this.url}/rellena/${numPosts}`);
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.url}/count`);
  }

  createRandom(cantidad: number): Observable<number> {
    return this.http.post<number>(`${this.url}/random/${cantidad}`, null);
  }

  getPagePublico(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.url}/publico?page=${page}&size=${size}`);
  }

  publicar(id: number): Observable<number> {
    return this.http.put<number>(`${this.url}/publicar/${id}`, null);
  }

  despublicar(id: number): Observable<number> {
    return this.http.put<number>(`${this.url}/despublicar/${id}`, null);
  }

  deleteAll(): Observable<number> {
    return this.http.delete<number>(`${this.url}/deleteall`);
  }
}