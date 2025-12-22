import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IFernandezIdea } from '../../../model/fernandez-idea';
import { FernandezIdeaService, IPageWithTotal } from '../../../service/fernandez-idea.service';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { BotoneraRpp } from "../../shared/botonera-rpp/botonera-rpp";
import { DatetimePipe } from '../../../pipe/datetime-pipe';
import { debug } from '../../../environment/environment';

@Component({
  selector: 'app-fernandez-routed-admin-plist',
  imports: [RouterLink, FormsModule, Paginacion, BotoneraRpp, DatetimePipe],
  templateUrl: './routed-admin-plist.html',
  styleUrl: './routed-admin-plist.css',
})
export class FernandezRoutedAdminPlist {
  private readonly oIdeaService = inject(FernandezIdeaService);
  protected readonly debugging = debug;
  
  oPage: IPageWithTotal<IFernandezIdea> | null = null;
  numPage: number = 0;
  numRpp: number = 5;
  // Search / filter / sort for admin (admin can see all)
  searchTerm: string = '';
  categoriaFilter: string = 'ALL';
  orderField: string = 'id';
  orderDirection: 'asc' | 'desc' = 'asc';
  // Totales para informar sin mentir: filtrado vs total sin filtrar
  totalRecordsAll: number = 0;
  totalRecordsFiltered: number = 0;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  // Bulk creation UI state
  showBulkWarning: boolean = false;
  pendingBulkAmount: number | null = null;
  // Loading indicator for bulk creation
  isBulkLoading: boolean = false;
  // Estado para vaciar la tabla
  isEmptying: boolean = false;
  showEmptyWarning: boolean = false;

  // UX feedback
  infoMessage: string | null = null;
  errorMessage: string | null = null;

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
        undefined,
        this.searchTerm,
        this.categoriaFilter
      )
      .subscribe({
        next: (data: IPageWithTotal<IFernandezIdea>) => {
          this.oPage = data;
          this.totalRecordsFiltered = data.totalElements ?? 0;
          this.totalRecordsAll = data.totalElementsAll ?? data.totalElements ?? 0;
          this.errorMessage = null;
        },
        error: (error: HttpErrorResponse) => {
          this.debugging && console.error(error);
          this.oPage = null;
          this.totalRecordsFiltered = 0;
          this.totalRecordsAll = 0;
          this.errorMessage = 'No se pudieron cargar las ideas.';
        },
      });
  }

  togglePublic(oIdea: IFernandezIdea) {
    this.infoMessage = null;
    this.errorMessage = null;

    const action = oIdea.publico ? 'despublicar' : 'publicar';
    const req$ = oIdea.publico ? this.oIdeaService.despublicar(oIdea.id) : this.oIdeaService.publicar(oIdea.id);
    req$.subscribe({
      next: () => {
        this.infoMessage = `Idea "${oIdea.titulo}" ${oIdea.publico ? 'despublicada' : 'publicada'} correctamente.`;
        this.getPage();
      },
      error: (err: HttpErrorResponse) => {
        this.debugging && console.error(err);
        this.errorMessage = `Error al ${action} la idea.`;
      },
    });
    return false;
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
   * Execute search immediately (used for Enter key or button click)
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
    this.orderField = field || 'id';
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

  onHeaderSort(field: string) {
    if (this.orderField === field) {
      this.toggleDirection();
      return false;
    }
    this.orderField = field;
    this.orderDirection = 'asc';
    this.numPage = 0;
    this.getPage();
    return false;
  }
  
    /**
     * Request bulk creation. If amount is high, show a warning card for confirmation.
     */
    // Threshold for showing the bulk warning card
    private readonly BULK_WARNING_THRESHOLD = 500;

    requestBulkCreate(amount: number = 20) {
      if (!amount || amount < 1) return;
      if (amount > this.BULK_WARNING_THRESHOLD) {
        this.pendingBulkAmount = amount;
        this.showBulkWarning = true;
        return;
      }
      this.bulkCreateIdeas(amount);
    }

    /**
     * Execute the bulk creation (called after confirmation when needed)
     */
    bulkCreateIdeas(amount: number = 20) {
      // reset any pending warning
      this.showBulkWarning = false;
      this.pendingBulkAmount = null;
      // show loading pop-up until backend finishes inserting
      this.isBulkLoading = true;
      this.oIdeaService.bulkCreate(amount).subscribe({
        next: () => {
          this.isBulkLoading = false;
          this.getPage();
        },
        error: (error: HttpErrorResponse) => {
          this.isBulkLoading = false;
          // Prefer an inline message in future; keep alert for now
          alert('Error al crear ideas fake');
          console.error(error);
        },
      });
    }

    cancelBulkCreate() {
      this.showBulkWarning = false;
      this.pendingBulkAmount = null;
    }

    /**
     * Muestra el modal de confirmación para vaciar la tabla
     */
    requestEmptyTable() {
      this.showEmptyWarning = true;
    }

    /**
     * Cancela la operación de vaciar tabla
     */
    cancelEmptyTable() {
      this.showEmptyWarning = false;
    }

    /**
     * Ejecuta el vaciado de la tabla
     */
    emptyTable() {
      this.showEmptyWarning = false;
      this.isEmptying = true;
      this.infoMessage = null;
      this.errorMessage = null;

      this.oIdeaService.empty().subscribe({
        next: (count: number) => {
          this.isEmptying = false;
          this.infoMessage = `Tabla vaciada correctamente. Se eliminaron ${count} ideas.`;
          this.numPage = 0;
          this.getPage();
        },
        error: (error: HttpErrorResponse) => {
          this.isEmptying = false;
          this.debugging && console.error(error);
          this.errorMessage = 'Error al vaciar la tabla.';
        },
      });
    }
}
