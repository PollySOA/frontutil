import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IFernandezIdea } from '../../../model/fernandez-idea';
import { FernandezIdeaService, IPageWithTotal } from '../../../service/fernandez-idea.service';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { FernandezUnroutedUserView } from "../unrouted-user-view/unrouted-user-view";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { debug } from '../../../environment/environment';

@Component({
  selector: 'app-fernandez-routed-user-plist',
  imports: [RouterLink, FormsModule, Paginacion, FernandezUnroutedUserView, BotoneraRpp],
  templateUrl: './routed-user-plist.html',
  styleUrl: './routed-user-plist.css',
})
export class FernandezRoutedUserPlist {
  private readonly oIdeaService = inject(FernandezIdeaService);
  protected readonly debugging = debug;
  
  oPage: IPageWithTotal<IFernandezIdea> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  // Search / filter / sort
  searchTerm: string = '';
  categoriaFilter: string = 'ALL';
  orderField: string = 'fechaCreacion';
  orderDirection: string = 'desc';
  // Totales para informar sin mentir: filtrado vs total sin filtrar
  totalRecordsAll: number = 0;
  totalRecordsFiltered: number = 0;

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    // UNA SOLA PETICIÓN al servidor
    this.oIdeaService
      .getPage(
        this.numPage,
        this.numRpp,
        this.orderField,
        this.orderDirection,
        true,
        this.searchTerm
      )
      .subscribe({
        next: (data: IPageWithTotal<IFernandezIdea>) => {
          this.oPage = data;
          this.totalRecordsFiltered = data.totalElements ?? 0;
          this.totalRecordsAll = data.totalElementsAll ?? data.totalElements ?? 0;
        },
        error: (error: HttpErrorResponse) => {
          this.debugging && console.error(error);
          this.oPage = null;
          this.totalRecordsFiltered = 0;
          this.totalRecordsAll = 0;
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
    this.numPage = 0;
    this.getPage();
    return false;
  }

  onSearchDebounce() {
    this.numPage = 0;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.getPage();
    }, 350);
    return false;
  }

  /**
   * Execute search immediately (used for Enter key)
   */
  onSearchImmediate() {
    this.numPage = 0;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
    this.getPage();
    return false;
  }

  onCategoriaChange() {
    this.numPage = 0;
    this.getPage();
    return false;
  }

  onOrderChange(field: string) {
    this.orderField = field || 'fechaCreacion';
    this.numPage = 0;
    this.getPage();
    return false;
  }

  toggleDirection() {
    this.orderDirection = this.orderDirection === 'asc' ? 'desc' : 'asc';
    this.numPage = 0;
    this.getPage();
    return false;
  }
}
