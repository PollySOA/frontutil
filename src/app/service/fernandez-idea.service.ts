import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { serverURL } from '../environment/environment';
import { IPage } from '../model/plist';
import { IFernandezIdea } from '../model/fernandez-idea';
import { Observable, map } from 'rxjs';

// Extender IPage para incluir totalElementsAll (total sin filtrar)
export interface IPageWithTotal<T> extends IPage<T> {
  totalElementsAll?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FernandezIdeaService {
  private readonly http = inject(HttpClient);

  getPage(
    page: number,
    rpp: number,
    order: string = 'id',
    direction: string = 'asc',
    publico?: boolean,
    search?: string,
    categoria?: string
  ): Observable<IPageWithTotal<IFernandezIdea>> {
    const hasSearch = search && search.trim() !== '';
    const hasCategoria = categoria && categoria !== 'ALL';
    const isDateOrder = order === 'fechaCreacion' || order === 'fechaModificacion';
    
    // Si hay búsqueda, filtro de categoría O ordenamos por fecha (para desempate por ID), pedimos TODOS los registros
    const needsLocalProcessing = hasSearch || hasCategoria || isDateOrder;
    
    let params = new HttpParams()
      .set('page', needsLocalProcessing ? '0' : page.toString())
      .set('size', needsLocalProcessing ? '10000' : rpp.toString())
      .set('sort', `${order || 'id'},${direction || 'asc'}`);
    if (publico !== undefined) {
      params = params.set('publico', String(publico));
    }
    
    // UNA SOLA PETICIÓN
    return this.http.get<IPage<IFernandezIdea>>(serverURL + '/idea', { params }).pipe(
      map((pageData) => {
        let content = pageData.content || [];
        const totalElementsAll = pageData.totalElements ?? content.length; // Total real del servidor
        
        // Filtrado defensivo si se pidió publico=true
        if (publico === true) {
          content = content.filter((i: IFernandezIdea) => i.publico);
        }
        
        // FILTRO POR CATEGORÍA
        if (hasCategoria) {
          content = content.filter((i: IFernandezIdea) => i.categoria === categoria);
        }
        
        // BÚSQUEDA LOCAL: filtrar por título o comentario
        if (hasSearch) {
          const term = search!.trim().toLowerCase();
          content = content.filter((i: IFernandezIdea) =>
            (i.titulo && i.titulo.toLowerCase().includes(term)) ||
            (i.comentario && i.comentario.toLowerCase().includes(term))
          );
        }
        
        // Si necesitamos procesamiento local (búsqueda, categoría o fecha), ordenar y paginar localmente
        if (needsLocalProcessing) {
          // ORDENAMIENTO LOCAL con desempate por ID
          content = this.sortContent(content, order, direction);
          
          // Calcular paginación local
          const totalElements = content.length;
          const totalPages = Math.ceil(totalElements / rpp) || 1;
          const start = page * rpp;
          const end = start + rpp;
          
          return {
            content: content.slice(start, end),
            totalElements,
            totalElementsAll, // Total sin filtrar
            totalPages,
            number: page,
            size: rpp,
            first: page === 0,
            last: page >= totalPages - 1,
            empty: totalElements === 0
          } as IPageWithTotal<IFernandezIdea>;
        }
        
        // Sin búsqueda ni fecha: devolver datos del servidor directamente
        (pageData as IPageWithTotal<IFernandezIdea>).totalElementsAll = totalElementsAll;
        return pageData as IPageWithTotal<IFernandezIdea>;
      })
    );
  }

  // Ordenar contenido localmente
  private sortContent(content: IFernandezIdea[], order: string, direction: string): IFernandezIdea[] {
    const dir = direction === 'desc' ? -1 : 1;
    return content.sort((a, b) => {
      let valA: any = (a as any)[order];
      let valB: any = (b as any)[order];
      
      // Manejar fechas
      if (order === 'fechaCreacion' || order === 'fechaModificacion') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }
      
      // Manejar strings
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      
      // Si son iguales y ordenamos por fecha, desempatar por id
      if (order === 'fechaCreacion' || order === 'fechaModificacion') {
        if (a.id < b.id) return -1 * dir;
        if (a.id > b.id) return 1 * dir;
      }
      
      return 0;
    });
  }

  get(id: number): Observable<IFernandezIdea> {
    return this.http.get<IFernandezIdea>(serverURL + '/idea/' + id);
  }

  create(idea: Partial<IFernandezIdea>): Observable<number> {
    return this.http.post<number>(serverURL + '/idea', idea);
  }

  update(idea: Partial<IFernandezIdea>): Observable<number> {
    return this.http.put<number>(serverURL + '/idea', idea);
  }

  delete(id: number): Observable<number> {
    return this.http.delete<number>(serverURL + '/idea/' + id);
  }

  publicar(id: number): Observable<number> {
    return this.http.put<number>(serverURL + '/idea/publicar/' + id, {});
  }

  despublicar(id: number): Observable<number> {
    return this.http.put<number>(serverURL + '/idea/despublicar/' + id, {});
  }

  count(publico?: boolean, search?: string, categoria?: string): Observable<number> {
    let url = serverURL + '/idea/count';
    let params: HttpParams | undefined;
    if (publico !== undefined) {
      params = (params || new HttpParams()).set('publico', String(publico));
    }
    if (search !== undefined && search !== '') {
      params = (params || new HttpParams()).set('search', search);
    }
    if (categoria !== undefined && categoria !== '' && categoria !== 'ALL') {
      params = (params || new HttpParams()).set('categoria', categoria);
    }
    return this.http.get<number>(url, params ? { params } : {});
  }

    bulkCreate(amount: number = 20): Observable<number> {
      // El backend debe tener un endpoint tipo /idea/bulk/{amount}
      return this.http.post<number>(serverURL + `/idea/bulk/${amount}`, {});
    }

    /**
     * Vaciar la tabla de ideas (DELETE /idea/empty)
     */
    empty(): Observable<number> {
      return this.http.delete<number>(serverURL + '/idea/empty');
    }
}
