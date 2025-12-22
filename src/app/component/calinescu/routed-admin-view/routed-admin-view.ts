import { Component } from '@angular/core';
import { ICalinescu } from '../../../model/calinescu';
import { CalinescuService } from '../../../service/calinescu.service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminViewCalinescu } from "../unrouted-admin-view/unrouted-admin-view";
import { debug } from '../../../environment/environment';

/**
 * Componente para visualizar los detalles de un item de la lista de compras (vista admin).
 * 
 * Obtiene y muestra la información completa de un item específico,
 * utilizando el componente unrouted-admin-view para la presentación.
 */
@Component({
  selector: 'app-routed-admin-view-calinescu',
  imports: [UnroutedAdminViewCalinescu],
  templateUrl: './routed-admin-view.html',
  styleUrl: './routed-admin-view.css',
})
export class RoutedAdminViewCalinescu {
  /** Item que se está visualizando */
  oCalinescu: ICalinescu | null = null;

  constructor(private oCalinescuService: CalinescuService, private route: ActivatedRoute) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      if (debug) console.error('Invalid id:', idParam);
      return;
    }
    this.getCalinescu(id);
  }

  ngOnInit() { }

  /**
   * Obtiene los datos del item desde el servidor.
   * 
   * @param id - ID del item a obtener
   */
  getCalinescu(id: number) {
    this.oCalinescuService.get(id).subscribe({
      next: (data: ICalinescu) => {
        this.oCalinescu = data;
      },
      error: (error: HttpErrorResponse) => {
        if (debug) console.error('Error fetching item:', error);
      },
    });
  }
}
