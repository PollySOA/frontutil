import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { IPage } from '../../../model/plist';
import { IGarcia } from '../../../model/garcia/garcia';
import { GarciaService } from '../../../service/garcia/garcia';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-Garciarouted-admin-plist',
  imports: [RouterLink, Paginacion, BotoneraRpp, DatetimePipe],
  templateUrl: './Garciarouted-admin-plist.html',
  styleUrl: './Garciarouted-admin-plist.css',
})
export class RoutedAdminPlistGarcia {
  oPage: IPage<IGarcia> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  rellenaCantidad: number = 10;
  rellenando: boolean = false;
  rellenaOk: number | null = null;
  rellenaError: string | null = null;

  constructor(private oGarciaService: GarciaService) { }

  oBotonera: string[] = [];

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.oGarciaService.getPage(this.numPage, this.numRpp).subscribe({
      next: (data: IPage<IGarcia>) => {
        this.oPage = data;
        this.rellenaOk = this.oPage.totalElements;
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
    this.oGarciaService.createRandom(this.rellenaCantidad).subscribe({
      next: (count: number) => {
        this.rellenando = false;
        this.rellenaOk = count;
        this.getPage(); // refresca el listado
      },
      error: (err: HttpErrorResponse) => {
        this.rellenando = false;
        this.rellenaError = 'Error generando datos fake';
        console.error(err);
      }
    });
  }

  publicar(id: number) {
    this.oGarciaService.publicar(id).subscribe({
      next: () => {
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al publicar:', err);
      }
    });
  }

  despublicar(id: number) {
    this.oGarciaService.despublicar(id).subscribe({
      next: () => {
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al despublicar:', err);
      }
    });
  }

  borrarTodos() {
    if (confirm('⚠️ ¿Estás seguro de que quieres borrar TODOS los objetivos? Esta acción no se puede deshacer.')) {
      this.rellenando = true;
      this.rellenaOk = null;
      this.rellenaError = null;

      this.oGarciaService.deleteAll().subscribe({
        next: (count: number) => {
          this.rellenando = false;
          this.rellenaOk = null;
          this.rellenaError = null;
          alert(`✅ Se han borrado ${count} objetivos correctamente`);
          this.getPage();
        },
        error: (err: HttpErrorResponse) => {
          this.rellenando = false;
          this.rellenaError = 'Error al borrar los objetivos';
          console.error(err);
        }
      });
    }
  }
}
