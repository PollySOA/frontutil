import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IPage } from '../../../model/plist';
import { IBlog } from '../../../model/blog';
import { BlogService } from '../../../service/blog';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { DatetimePipe } from "../../../pipe/datetime-pipe";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-routed-admin-plist',
  imports: [RouterLink, Paginacion, BotoneraRpp, DatetimePipe, MatDialogModule, MatSnackBarModule],
  templateUrl: './routed-admin-plist.html',
  styleUrl: './routed-admin-plist.css',
})
export class RoutedAdminPlist {
  oPage: IPage<IBlog> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  rellenaCantidad: number = 10;
  rellenando: boolean = false;
  rellenaOk: number | null = null;
  rellenaError: string | null = null;
  // estado para vaciar la tabla
  emptying: boolean = false;
  emptyOk: number | null = null;
  emptyError: string | null = null;
  // contador actual de elementos en la tabla
  totalElementsCount: number = 0;
  // track id being published/unpublished to show spinner per-row
  publishingId: number | null = null;
  publishingAction: 'publicar' | 'despublicar' | null = null;

  constructor(private oBlogService: BlogService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  oBotonera: string[] = [];
  orderField: string = 'id';
  orderDirection: string = 'asc';

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.oBlogService.getPage(this.numPage, this.numRpp, this.orderField, this.orderDirection).subscribe({
      next: (data: IPage<IBlog>) => {
        this.oPage = data;
        // actualizar contador actual
        this.totalElementsCount = data.totalElements ?? 0;
        this.rellenaOk = this.totalElementsCount;
        // si estamos en una página que supera el límite entonces nos situamos en la ultima disponible
        if (this.numPage > 0 && this.numPage >= data.totalPages) {
          this.numPage = data.totalPages - 1;
          this.getPage();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  onOrder(order: string) {
    if (this.orderField === order) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderField = order;
      this.orderDirection = 'asc';
    }
    this.numPage = 0;
    this.getPage();
    return false;
  }

  goToPage(numPage: number) {
    this.numPage = numPage;
    this.getPage();
    return false;
  }

  onRppChange(n: number) {
    this.numRpp = n;
    this.getPage();
    return false;
  }

  onCantidadChange(value: string) {
    this.rellenaCantidad = +value;
    return false;
  }

  generarFake() {
    this.rellenaOk = null;
    this.rellenaError = null;
    this.rellenando = true;
    // notificar inicio con el conteo actual
    this.snackBar.open(`Generando ${this.rellenaCantidad} posts... (actual: ${this.totalElementsCount})`, 'Cerrar', { duration: 3000 });
    this.oBlogService.rellenaBlog(this.rellenaCantidad).subscribe({
      next: (count: number) => {
        this.rellenando = false;
        this.rellenaOk = count;
        // refrescamos listado y notificamos resultado
        this.getPage();
        this.snackBar.open(`Generados ${count} posts. Total ahora: ${this.totalElementsCount + count}`, 'Cerrar', { duration: 4000 });
      },
      error: (err: HttpErrorResponse) => {
        this.rellenando = false;
        this.rellenaError = 'Error generando datos fake';
        console.error(err);
        this.snackBar.open('Error generando datos de prueba', 'Cerrar', { duration: 4000 });
      }
    });
  }

  openEmptyConfirm() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Vaciar tabla de Posts',
        message: '¿Está seguro de que desea borrar TODOS los posts? Esta acción es irreversible.'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.doEmpty();
      }
    });
  }

  private doEmpty() {
    this.emptying = true;
    this.emptyOk = null;
    this.emptyError = null;
    // notificar inicio con el conteo actual
    this.snackBar.open(`Vaciando tabla... (actual: ${this.totalElementsCount})`, 'Cerrar', { duration: 3000 });
    this.oBlogService.empty().subscribe({
      next: (count: number) => {
        this.emptying = false;
        this.emptyOk = count;
        // refrescar listado
        this.numPage = 0;
        this.getPage();
        this.snackBar.open(`Tabla vaciada. Eliminados: ${count}. Total ahora: 0`, 'Cerrar', { duration: 4000 });
      },
      error: (err: HttpErrorResponse) => {
        this.emptying = false;
        this.emptyError = 'Error vaciando la tabla';
        console.error(err);
        this.snackBar.open('Error al vaciar la tabla', 'Cerrar', { duration: 4000 });
      }
    });
  }

  publicar(id: number) {
    this.publishingId = id;
    this.publishingAction = 'publicar';
    this.oBlogService.publicar(id).subscribe({
      next: () => {
        this.publishingId = null;
        this.publishingAction = null;
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.publishingId = null;
        this.publishingAction = null;
      }
    });
    return false;
  }

  despublicar(id: number) {
    this.publishingId = id;
    this.publishingAction = 'despublicar';
    this.oBlogService.despublicar(id).subscribe({
      next: () => {
        this.publishingId = null;
        this.publishingAction = null;
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.publishingId = null;
        this.publishingAction = null;
      }
    });
    return false;
  }
}
