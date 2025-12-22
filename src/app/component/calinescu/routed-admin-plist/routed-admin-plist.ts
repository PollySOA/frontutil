import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from '../../../environment/environment';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { IPage } from '../../../model/plist';
import { ICalinescu } from '../../../model/calinescu';
import { CalinescuService } from '../../../service/calinescu.service';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { DatetimePipe } from "../../../pipe/datetime-pipe";

/**
 * Componente para mostrar el listado paginado de items de la lista de compras (vista admin).
 * 
 * Proporciona funcionalidades de administración como:
 * - Visualización de items en tabla paginada
 * - Control de registros por página (RPP)
 * - Generación de datos de prueba
 * - Enlaces a edición, visualización y eliminación de items
 */
@Component({
  selector: 'app-routed-admin-plist',
  imports: [RouterLink, Paginacion, BotoneraRpp, DatetimePipe, DecimalPipe],
  templateUrl: './routed-admin-plist.html',
  styleUrl: './routed-admin-plist.css',
})
export class RoutedAdminPlistCalinescu {
  /** Objeto de página con los items y metadatos de paginación */
  oPage: IPage<ICalinescu> | null = null;
  
  /** Número de página actual (base 0) */
  numPage: number = 0;
  
  /** Cantidad de registros por página */
  numRpp: number = 5;
  
  /** Cantidad de items a generar en la función de relleno */
  rellenaCantidad: number = 10;
  
  /** Indica si se está ejecutando la operación de relleno */
  rellenando: boolean = false;
  
  /** Número de items creados exitosamente en el último relleno */
  rellenaOk: number | null = null;
  
  /** Mensaje de error si falla la operación de relleno */
  rellenaError: string | null = null;
  totalGlobal: number = 0;
  borrandoTodo: boolean = false;

  constructor(
    private oCalinescuService: CalinescuService,
    private dialog: MatDialog
  ) { }

  oBotonera: string[] = [];
  // publishing state to show per-row spinner
  publishingId: number | null = null;
  publishingAction: 'publicar' | 'despublicar' | null = null;
  // ordering & filtering
  orderField: string = 'id';
  orderDirection: string = 'asc';
  filterText: string = '';
  filterTimeout: any = null;
  totalSinFiltro: number = 0;

  ngOnInit() {
    this.obtenerPagina();
    this.cargarTotalGlobal();
  }

  /**
   * Obtiene la página actual de items desde el servidor.
   * Valida que la página solicitada exista y ajusta si es necesario.
   */
  obtenerPagina() {
  this.oCalinescuService.getPageWithFilter(this.numPage, this.numRpp, this.orderField, this.orderDirection, false, this.filterText).subscribe({
      next: (data: IPage<ICalinescu>) => {
        this.oPage = data;
        // si estamos en una página que supera el límite entonces nos situamos en la ultima disponible
        if (this.numPage > 0 && this.numPage >= data.totalPages) {
          this.numPage = data.totalPages - 1;
          this.obtenerPagina();
        }
        // Cargar total sin filtro si hay filtro activo
        if (this.filterText) {
          this.cargarTotalSinFiltro();
        } else {
          this.totalSinFiltro = data.totalElements;
        }
      },
      error: (error: HttpErrorResponse) => {
        if (debug) console.error(error);
      },
    });
  }

  /**
   * Navega a una página específica del listado.
   * 
   * @param numPage - Número de página a mostrar
   * @returns false para prevenir comportamiento por defecto del evento
   */
  irAPagina(numPage: number) {
    this.numPage = numPage;
    this.obtenerPagina();
    return false;
  }

  /**
   * Cambia la cantidad de registros mostrados por página.
   * 
   * @param n - Nueva cantidad de registros por página
   * @returns false para prevenir comportamiento por defecto del evento
   */
  cambiarRpp(n: number) {
    this.numRpp = n;
    this.obtenerPagina();
    return false;
  }

  /**
   * Actualiza la cantidad de items a generar en el relleno.
   * 
   * @param value - Nuevo valor de cantidad como string
   * @returns false para prevenir comportamiento por defecto del evento
   */
  cambiarCantidad(value: string) {
    this.rellenaCantidad = +value;
    return false;
  }

  onOrder(order: string) {
    if (this.orderField === order) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderField = order;
      this.orderDirection = 'asc';
    }
    this.numPage = 0;
    this.obtenerPagina();
    return false;
  }

  /**
   * Maneja los cambios en el filtro de texto.
   * Implementa debounce de 400ms para evitar peticiones excesivas al servidor.
   * 
   * @param value - Texto ingresado en el campo de filtro
   * @returns false para prevenir comportamiento por defecto del evento
   */
  onFilterChange(value: string) {
    this.filterText = value;
    if (this.filterTimeout) {
      clearTimeout(this.filterTimeout);
    }
    this.filterTimeout = setTimeout(() => {
      this.numPage = 0;
      this.obtenerPagina();
    }, 400);
    return false;
  }

  /**
   * Calcula el total de precios de los items en la página actual.
   * 
   * @returns Suma de todos los precios de la página actual
   */
  calcularTotal(): number {
    if (!this.oPage || !this.oPage.content) return 0;
    return this.oPage.content.reduce((sum, item) => sum + (item.precio || 0), 0);
  }

  /**
   * Carga el total global de precios de todos los items desde el servidor.
   */
  cargarTotalGlobal() {
    this.oCalinescuService.getTotalPrecios().subscribe({
      next: (total: number) => {
        this.totalGlobal = total;
      },
      error: (error: HttpErrorResponse) => {
        if (debug) console.error('Error al cargar total global:', error);
      },
    });
  }

  /**
   * Carga el total de registros sin aplicar el filtro actual.
   * Utilizado para mostrar "X registros filtrados de Y totales".
   */
  cargarTotalSinFiltro() {
    this.oCalinescuService.getCount(false, '').subscribe({
      next: (total: number) => {
        this.totalSinFiltro = total;
      },
      error: (error: HttpErrorResponse) => {
        if (debug) console.error('Error al cargar total sin filtro:', error);
      },
    });
  }

  /**
   * Genera datos de prueba en el servidor.
   * Muestra mensaje de éxito con la cantidad generada y lo oculta después de 5 segundos.
   */
  generarDatosFalsos() {
    this.rellenaOk = null;
    this.rellenaError = null;
    this.rellenando = true;
    this.oCalinescuService.rellenaListaCompra(this.rellenaCantidad).subscribe({
      next: (count: number) => {
        this.rellenando = false;
        this.rellenaOk = this.rellenaCantidad; // Mostrar la cantidad que se acaba de generar, no el total
        this.obtenerPagina();
        this.cargarTotalGlobal(); // Actualizar total después de generar datos
        
        // Hacer que el mensaje desaparezca después de 5 segundos
        setTimeout(() => {
          this.rellenaOk = null;
        }, 5000);
      },
      error: (err: HttpErrorResponse) => {
        this.rellenando = false;
        this.rellenaError = 'Error generando datos fake';
        if (debug) console.error(err);
        
        // Hacer que el error desaparezca después de 5 segundos
        setTimeout(() => {
          this.rellenaError = null;
        }, 5000);
      }
    });
  }

  /**
   * Muestra un diálogo de confirmación antes de borrar todos los elementos.
   */
  confirmarBorrarTodo() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmación de Borrado Irreversible',
        message: '¿Estás seguro de que deseas borrar TODOS los elementos? Esta acción no se puede deshacer.'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.ejecutarBorrarTodo();
      }
    });
  }

  /**
   * Ejecuta el borrado de todos los elementos tras la confirmación.
   * Actualiza el listado y el total global tras la eliminación.
   */
  ejecutarBorrarTodo() {
    this.borrandoTodo = true;
    this.rellenaError = null;
    this.rellenaOk = null;
    this.oCalinescuService.deleteAll().subscribe({
      next: (count: number) => {
        this.borrandoTodo = false;
        this.obtenerPagina();
        this.cargarTotalGlobal();
      },
      error: (err: HttpErrorResponse) => {
        this.borrandoTodo = false;
        this.rellenaError = 'Error al borrar todos los elementos';
        if (debug) console.error(err);
        
        // Hacer que el error desaparezca después de 5 segundos
        setTimeout(() => {
          this.rellenaError = null;
        }, 5000);
      }
    });
  }

  /**
   * Publica un item específico.
   * Muestra un spinner mientras se ejecuta la operación.
   * 
   * @param id - ID del item a publicar
   * @returns false para prevenir comportamiento por defecto del evento
   */
  publicar(id: number) {
    this.publishingId = id;
    this.publishingAction = 'publicar';
    this.oCalinescuService.publicar(id).subscribe({
      next: () => {
        this.publishingId = null;
        this.publishingAction = null;
        this.obtenerPagina();
        this.cargarTotalGlobal();
      },
      error: (err: any) => {
        if (debug) console.error(err);
        this.publishingId = null;
        this.publishingAction = null;
      }
    });
    return false;
  }

  /**
   * Despublica un item específico (lo oculta de la vista pública).
   * Muestra un spinner mientras se ejecuta la operación.
   * 
   * @param id - ID del item a despublicar
   * @returns false para prevenir comportamiento por defecto del evento
   */
  despublicar(id: number) {
    this.publishingId = id;
    this.publishingAction = 'despublicar';
    this.oCalinescuService.despublicar(id).subscribe({
      next: () => {
        this.publishingId = null;
        this.publishingAction = null;
        this.obtenerPagina();
        this.cargarTotalGlobal();
      },
      error: (err: any) => {
        if (debug) console.error(err);
        this.publishingId = null;
        this.publishingAction = null;
      }
    });
    return false;
  }
}
