import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { IPage } from '../../../model/plist';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { DatetimePipe } from "../../../pipe/datetime-pipe";
import { SalinasService } from '../../../service/salinas-receta';
import { ISalinasReceta } from '../../../model/salinas-receta';
import { CommonModule } from '@angular/common'; // Necesario para @if y @for
import { FormsModule } from '@angular/forms'; // Necesario para el select
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-salinas-routed-admin-plist',
  standalone: true, // Asumo que es un componente standalone
  imports: [RouterLink, Paginacion, BotoneraRpp, DatetimePipe, CommonModule, FormsModule], // Asegúrate de incluir CommonModule y FormsModule
  templateUrl: './routed-admin-plist.html',
  styleUrl: './routed-admin-plist.css',
})
export class SalinasRoutedAdminPlist {
  oPage: IPage<ISalinasReceta> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  rellenaCantidad: number = 10;
  rellenando: boolean = false;
  rellenaOk: number | null = null;
  rellenaError: string | null = null;
  emptying: boolean = false;
  emptyOk: number | null = null;
  emptyError: string | null = null;
  totalElementsCount: number = 0;
  publishingId: number | null = null;
  publishingAction: 'publicar' | 'despublicar' | null = null;

  message: string | null = null;
  totalRecords: number = 0;


  constructor(private oSalinasService: SalinasService, private dialog: MatDialog, private route: ActivatedRoute, private snackBar: MatSnackBar) { }

  oBotonera: string[] = [];
  orderField: string = 'id';
  orderDirection: string = 'asc';

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    // Usamos 'id' y 'asc' como ordenación por defecto
    this.oSalinasService.getPage(this.numPage, this.numRpp, 'id', 'asc').subscribe({ 
      next: (data: IPage<ISalinasReceta>) => {
        this.oPage = data;
        // actualizar contador actual
        this.totalElementsCount = data.totalElements ?? 0;
        this.rellenaOk = this.totalElementsCount;
        // La variable rellenaOk ahora solo muestra el éxito del bulkCreate, no el total
        // this.rellenaOk = this.oPage.totalElements; // LINEA ELIMINADA (confunde el mensaje de éxito)
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
    this.snackBar.open(`Generando ${this.rellenaCantidad} posts... (actual: ${this.totalElementsCount})`, 'Cerrar', { duration: 3000 });
    // ¡CORRECCIÓN AQUÍ! Llama al método bulkCreate del servicio
    this.oSalinasService.bulkCreate(this.rellenaCantidad).subscribe({ 
      next: (count: number) => {
        this.rellenando = false;
        // El backend devuelve el total. Aquí mostramos la cantidad generada.
        this.rellenaOk = this.rellenaCantidad; 
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
    this.snackBar.open(`Vaciando tabla... (actual: ${this.totalRecords})`, 'Cerrar', { duration: 3000 });
    this.oSalinasService.empty().subscribe({
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
    this.oSalinasService.publicar(id).subscribe({
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
    this.oSalinasService.despublicar(id).subscribe({
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
