import { Component } from '@angular/core';
import { ICalinescu } from '../../../model/calinescu';
import { CalinescuService } from '../../../service/calinescu.service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedUserViewCalinescu } from "../unrouted-user-view/unrouted-user-view";
import { debug } from '../../../environment/environment';

/**
 * Componente para visualizar los detalles de un item de la lista de compras (vista usuario).
 * 
 * Muestra la información completa de un item específico en un formato
 * orientado al usuario final, utilizando el componente unrouted-user-view.
 */
@Component({
  selector: 'app-routed-user-view-calinescu',
  imports: [UnroutedUserViewCalinescu],
  templateUrl: './routed-user-view.html',
  styleUrls: ['./routed-user-view.css'],
})
export class RoutedUserViewCalinescu {
  /** Item que se está visualizando */
  oCalinescu: ICalinescu | null = null;

  constructor(private oCalinescuService: CalinescuService, private route: ActivatedRoute) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      if (debug) console.error('Invalid id:', idParam);
      return;
    }
    this.obtenerCalinescu(id);
  }

  ngOnInit() { }

  /**
   * Obtiene los datos del item desde el servidor.
   * 
   * @param id - ID del item a obtener
   */
  obtenerCalinescu(id: number) {
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
