import { Component, OnInit } from '@angular/core';
import { IPage } from '../../../model/plist';
import { IPallas } from '../../../model/pallas';
import { PallasService } from '../../../service/pallasService';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Paginacion } from '../../shared/paginacion/paginacion';
import { BotoneraRpp } from '../../shared/botonera-rpp/botonera-rpp';

@Component({
  selector: 'app-pallas-plist',
  standalone: true,
  imports: [RouterLink, DatePipe, Paginacion, BotoneraRpp],
  templateUrl: './pallas-plist.html',
  styleUrl: './pallas-plist.css',
})
export class PallasPlist implements OnInit {

  // VARIABLES
  allData: IPallas[] = [];          // Copia de seguridad de TODO
  oPage: IPage<IPallas> | null = null; // Lo que se ve en pantalla
  
  nPage: number = 0;
  nRpp: number = 10;
  strResult: string = "";
  filter: string = "";
  nTotalReal: number = 0; // Para el requisito de "Total registros en tabla"

  constructor(
    private oPallasService: PallasService
  ) { }

  ngOnInit() {
    this.getAllData();
  }
  
  getAllData() {
    this.oPallasService.getPage(0, 10000, 'id', 'asc', '').subscribe({
      next: (data: IPage<IPallas>) => {
        this.allData = data.content;
        this.nTotalReal = data.totalElements; // Guardamos total real
        this.renderizar(); // Pintamos la primera vez
      },
      error: (error: HttpErrorResponse) => {
        this.strResult = "Error al cargar: " + error.message;
      }
    });
  }

  togglePublicado(nota: IPallas) {
    const notaModificada = { ...nota, publicado: !nota.publicado };

    this.oPallasService.update(notaModificada).subscribe({
      next: () => {
        const indice = this.allData.findIndex(x => x.id === nota.id);
        if (indice !== -1) {
          this.allData[indice].publicado = !this.allData[indice].publicado;
          this.renderizar(); 
        }
      },
      error: (err) => this.strResult = "Error al cambiar estado: " + err.message
    });
  }

  renderizar() {
    const filtroMin = this.filter.toLowerCase();
    const datosFiltrados = this.allData.filter(nota => 
        nota.titulo.toLowerCase().includes(filtroMin) || 
        nota.contenido.toLowerCase().includes(filtroMin)
    );

    const start = this.nPage * this.nRpp;
    const end = start + this.nRpp;
    const datosPagina = datosFiltrados.slice(start, end);

    this.oPage = {
      content: datosPagina,
      totalElements: datosFiltrados.length,
      totalPages: Math.ceil(datosFiltrados.length / this.nRpp),
      number: this.nPage,
      size: this.nRpp,
      numberOfElements: datosPagina.length,
      first: this.nPage === 0,
      last: end >= datosFiltrados.length,
      empty: datosPagina.length === 0,
      
      sort: { sorted: true, unsorted: false, empty: false },
      
      pageable: { 
        sort: { sorted: true, unsorted: false, empty: false }, 
        // ------------------------------------------------
        offset: 0, 
        pageNumber: 0, 
        pageSize: 0, 
        paged: true, 
        unpaged: false 
      }
    };
  }

  // 4. EVENTOS
  onSetPage(nPage: number) {
    this.nPage = nPage;
    this.renderizar();
  }

  onSetRpp(nRpp: number) {
    this.nRpp = nRpp;
    this.nPage = 0;
    this.renderizar();
  }

  onFilterChange(filter: string) {
    this.filter = filter;
    this.nPage = 0;
    this.renderizar();
  }

  rellenar() {
    this.oPallasService.rellenar(50).subscribe({
      next: (num: number) => {
        this.strResult = "Se han creado " + num + " registros nuevos.";
        this.getAllData(); // Recargamos todo
      },
      error: (err: HttpErrorResponse) => {
        this.strResult = "Error: " + err.message;
      }
    });
  }
}