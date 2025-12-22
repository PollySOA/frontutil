import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPallas } from '../model/pallas';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
@Injectable({
  providedIn: 'root'
})
export class PallasService {


  constructor(private oHttp: HttpClient) { }

  // 1. GET PAGE (Listado paginado)

  getPage(page: number, rpp: number, order: string = '',direction: string = '',filter: string = ''): Observable<IPage<IPallas>> {
      if (order === '') {
        order = 'id';
      }
      if (direction === '') {
        direction = 'asc';
      }
      let strUrl = serverURL + `/pallas?page=${page}&size=${rpp}&sort=${order},${direction}`;
      if (filter.length > 0) {
        strUrl += `&filter=${filter}`;
      }

      return this.oHttp.get<IPage<IPallas>>(strUrl);;
    }

  // 2. GET (Uno solo)
  get(id: number): Observable<IPallas> {
    return this.oHttp.get<IPallas>(serverURL + '/pallas/' + id);
  }

  // 3. CREATE (Crear)
  create(oPallasEntity: IPallas): Observable<number> {
    return this.oHttp.post<number>(serverURL + '/pallas', oPallasEntity);
  }

  // 4. UPDATE (Editar)
  update(oPallasEntity: IPallas): Observable<number> {
    return this.oHttp.put<number>(serverURL + '/pallas', oPallasEntity);
  }

  // 5. DELETE (Borrar)
  delete(id: number): Observable<number> {
    return this.oHttp.delete<number>(serverURL + "/pallas/" + id);
  }

  // 6. Rellenar
  rellenar(amount: number): Observable<number> {
    return this.oHttp.get<number>(serverURL + "/pallas/rellena/" + amount);
  }

  // 7. GET PUBLIC PREVIEW
  getPublicPreview(): Observable<IPallas[]> {
  return this.oHttp.get<IPallas[]>(
    serverURL + '/pallas/public/preview'
  );
}

}