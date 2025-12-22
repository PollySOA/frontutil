import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PallasService } from '../../../service/pallasService'; // Ajusta la ruta si es necesario
import { IPallas } from '../../../model/pallas';
import { IPage } from '../../../model/plist';
import { DatePipe } from '@angular/common'; 
import { Paginacion } from "../../shared/paginacion/paginacion";

@Component({
  selector: 'app-pallas-preview',
  standalone: true, 
  imports: [RouterLink, DatePipe, Paginacion],
  templateUrl: './pallas-preview.html',
  styleUrl: './pallas-preview.css',
})
export class PallasPreview implements OnInit {

  // INYECCIÓN DE DEPENDENCIAS

  private oPallasService = inject(PallasService);

  allPublished: IPallas[] = [];
  
  visibleNotes: IPallas[] = [];
  
  oPage: IPage<IPallas> | null = null; 

  // Configuración
  nPage: number = 0;
  nRpp: number = 3; 
  strResult: string = "";

  ngOnInit() {
    this.loadAllPublished();
  }

  loadAllPublished() {
    // Pedimos 10.000 para traer TODO de la base de datos
    this.oPallasService.getPage(0, 10000, 'id', 'desc').subscribe({
      next: (data) => {
        // 1. FILTRAMOS: Nos quedamos SOLO con los publicados
        this.allPublished = data.content.filter(nota => nota.publicado === true);
        
        // 2. Renderizamos la primera página
        this.nPage = 0;
        this.updateView();
      },
      error: (err) => {
        this.strResult = 'Error al cargar las notas.';
        console.error(err);
      }
    });
  }

  updateView() {
    // Calculamos dónde cortar el array
    const start = this.nPage * this.nRpp;
    const end = start + this.nRpp;

    // Cortamos los 3 registros que tocan
    this.visibleNotes = this.allPublished.slice(start, end);

    // Creamos el objeto Page manual
    this.oPage = {
      content: this.visibleNotes,
      totalElements: this.allPublished.length,
      totalPages: Math.ceil(this.allPublished.length / this.nRpp),
      number: this.nPage,
      size: this.nRpp,
      numberOfElements: this.visibleNotes.length,
      first: this.nPage === 0,
      last: end >= this.allPublished.length,
      empty: this.visibleNotes.length === 0,
      
      sort: { sorted: true, unsorted: false, empty: false }, 
      
      pageable: { 
        sort: { sorted: true, unsorted: false, empty: false }, 
        offset: start, 
        pageNumber: this.nPage, 
        pageSize: this.nRpp, 
        paged: true, 
        unpaged: false 
      }
    };
  }

  onSetPage(nPage: number) {
    this.nPage = nPage;
    this.updateView(); // Solo actualizamos la vista local
  }
}