import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
import { IBlog } from '../model/blog';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogService {

  constructor(private oHttp: HttpClient) { }

  getPage(page: number, rpp: number, order: string = '', direction: string = ''): Observable<IPage<IBlog>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    return this.oHttp.get<IPage<IBlog>>(serverURL + `/blog?page=${page}&size=${rpp}&sort=${order},${direction}`);
  }

  get(id: number): Observable<IBlog> {
    return this.oHttp.get<IBlog>(serverURL + '/blog/' + id);
  }

  create(blog: Partial<IBlog>): Observable<number> {
    return this.oHttp.post<number>(serverURL + '/blog', blog);
  }

  update(blog: Partial<IBlog>): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/blog', blog);
  }

  delete(id: number): Observable<number> {
    return this.oHttp.delete<number>(serverURL + '/blog/' + id);
  }

  rellenaBlog(numPosts: number): Observable<number> {
    return this.oHttp.get<number>(serverURL + '/blog/rellena/' + numPosts);
  }

  publicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/blog/publicar/' + id, {});
  }

  despublicar(id: number): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/blog/despublicar/' + id, {});
  }

}
