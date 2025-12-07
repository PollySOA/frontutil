import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { IPage } from '../../../model/plist';
import { ISoares } from '../../../model/soares';
import { SoaresService } from '../../../service/soares';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";

@Component({
  selector: 'app-soares-routed-admin-plist',
  imports: [RouterLink, FormsModule, CommonModule, Paginacion, BotoneraRpp],
  templateUrl: './routed-admin-plist.html',
  styleUrl: './routed-admin-plist.css',
})
export class SoaresRoutedAdminPlist {
  oPage: IPage<ISoares> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  rellenaCantidad: number = 10;
  rellenando: boolean = false;
  rellenaOk: number | null = null;
  rellenaError: string | null = null;
  searchText: string = '';
  searchTimeout: any = null;
  orderField: string = 'id';
  orderDirection: string = 'asc';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  filtroPublicacion: 'todas' | 'publicadas' | 'solicitudes' = 'todas';
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(private oSoaresService: SoaresService) { }

  oBotonera: string[] = [];

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    let soloPendientes = false;
    let filter = this.searchText;
    
    if (this.filtroPublicacion === 'solicitudes') {
      soloPendientes = true;
    }

    this.oSoaresService.getPageAdmin(this.numPage, this.numRpp, this.orderField, this.orderDirection, filter, soloPendientes).subscribe({
      next: (data: IPage<ISoares>) => {
        // Client-side filtering for "publicadas" since backend doesn't support it in admin endpoint
        if (this.filtroPublicacion === 'publicadas') {
          data.content = data.content.filter(item => item.publicacion === true);
        }
        this.oPage = data;
        this.rellenaOk = null;
        this.rellenaError = null;
        if (this.numPage > 0 && this.numPage >= data.totalPages) {
          this.numPage = data.totalPages - 1;
          this.getPage();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.mostrarToast('Error al cargar las preguntas', 'error');
      },
    });
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
    this.oSoaresService.populate(this.rellenaCantidad).subscribe({
      next: (count: number) => {
        this.rellenando = false;
        this.rellenaOk = count;
        this.mostrarToast(`${count} frases generadas correctamente`, 'success');
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        this.rellenando = false;
        this.rellenaError = 'Error generando datos fake';
        this.mostrarToast('Error generando frases', 'error');
        console.error(err);
      },
    });
  }

  vaciarPreguntas() {
    if (!confirm('¿Estás seguro de que deseas vaciar todas las preguntas?')) {
      return;
    }
    this.oSoaresService.empty().subscribe({
      next: () => {
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error vaciando preguntas:', err);
      },
    });
  }

  togglePublicacion(oSoares: ISoares) {
    oSoares.publicacion = !oSoares.publicacion;
    this.oSoaresService.updateOne(oSoares).subscribe({
      next: () => {
        this.mostrarToast(oSoares.publicacion ? 'Pregunta publicada correctamente' : 'Pregunta despublicada correctamente', 'success');
        this.getPage();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        oSoares.publicacion = !oSoares.publicacion;
        this.mostrarToast('Error al actualizar la publicación', 'error');
      },
    });
  }

  onSearchChange(value: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    this.searchTimeout = setTimeout(() => {
      this.searchTimeout = null;
      this.numPage = 0;
      this.getPage();
    }, 500);
  }

  limpiarBusqueda() {
    this.searchText = '';
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.numPage = 0;
    this.getPage();
  }

  ordenar(field: string) {
    if (this.orderField === field) {
      this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.orderField = field;
      this.orderDirection = 'asc';
    }
    this.numPage = 0;
    this.getPage();
  }

  setSortColumn(column: string) {
    this.orderField = column;
    this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    this.numPage = 0;
    this.getPage();
    return false;
  }

  filtrarPor(filtro: 'todas' | 'publicadas' | 'solicitudes') {
    this.filtroPublicacion = filtro;
    this.numPage = 0;
    this.getPage();
  }

  confirmarVaciar() {
    this.oSoaresService.empty().subscribe({
      next: () => {
        this.rellenaOk = null;
        this.rellenaError = null;
        this.mostrarToast('Todas las preguntas han sido eliminadas', 'success');
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error vaciando preguntas:', err);
        this.mostrarToast('Error al vaciar las preguntas', 'error');
      },
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    setTimeout(() => this.toastMessage = null, 2000);
  }
}
