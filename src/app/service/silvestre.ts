import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
import { ISilvestre } from '../model/silvestre';

@Injectable({
  providedIn: 'root',
})
export class SilvestreService {
  private readonly http = inject(HttpClient);

  getPage(page: number, rpp: number, order: string = '', direction: string = ''): Observable<IPage<ISilvestre>> {
    if (order === '') {
      order = 'id';
    }
    if (direction === '') {
      direction = 'asc';
    }
    return this.http.get<IPage<ISilvestre>>(
      `${serverURL}/silvestre?page=${page}&size=${rpp}&sort=${order},${direction}`
    );
  }

  get(id: number): Observable<ISilvestre> {
    return this.http.get<ISilvestre>(`${serverURL}/silvestre/${id}`);
  }

  create(silvestre: Partial<ISilvestre>): Observable<number> {

    // esto es para evitar enviar campos que gestiona el servidor
  const payload = { ...silvestre } as Partial<ISilvestre> & Record<string, unknown>;
  // eliminar campos que no se deben enviar
  delete payload.id;
  delete payload.fechaCreacion;
  delete payload.fechaModificacion;
    return this.http.post<number>(`${serverURL}/silvestre`, payload);
  }

  update(silvestre: Partial<ISilvestre>): Observable<number> {
    //normalizar fechas para evitar problemas con el formato
    const payload = { ...silvestre } as Partial<ISilvestre>;
    if (payload.fechaCreacion) {
      payload.fechaCreacion = normalizeDate(payload.fechaCreacion);
    }
    if (payload.fechaModificacion) {
      payload.fechaModificacion = normalizeDate(payload.fechaModificacion);
    }
  return this.http.put<number>(`${serverURL}/silvestre`, payload);
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(`${serverURL}/silvestre/${id}`);
  }

  rellenaSilvestre(num: number): Observable<number> {
    return this.http.get<number>(`${serverURL}/silvestre/rellena/${num}`);
  }

  /**
   * Vaciar la tabla de silvestre (DELETE /silvestre/empty)
   * Devuelve el número de filas eliminadas
   */
  empty(): Observable<number> {
    return this.http.delete<number>(`${serverURL}/silvestre/empty`);
  }

  publicar(id: number): Observable<number> {
    return this.http.put<number>(`${serverURL}/silvestre/publicar/${id}`, {});
  }

  despublicar(id: number): Observable<number> {
    return this.http.put<number>(`${serverURL}/silvestre/despublicar/${id}`, {});
  }
}

// está función normaliza una fecha para evitar problemas de formato al enviarla al backend
function normalizeDate(date: string | Date | unknown): string {
  if (date instanceof Date) {
    // convierte a formato ISO
    return date.toISOString();
  }
  if (typeof date === 'string') {
    if (date.includes('T')) {
      return date;
    }
    // remplaza espacio por T
    return date.replace(' ', 'T');
  }
  return String(date);
}