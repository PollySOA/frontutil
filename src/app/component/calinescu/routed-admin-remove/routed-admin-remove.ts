import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalinescuService } from '../../../service/calinescu.service';
import { debug } from '../../../environment/environment';
import { ICalinescu } from '../../../model/calinescu';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminViewCalinescu } from "../unrouted-admin-view/unrouted-admin-view";

/**
 * Componente para eliminar un item de la lista de compras (vista admin).
 * 
 * Muestra la información del item a eliminar y solicita confirmación
 * antes de realizar la eliminación definitiva.
 * Características:
 * - Visualización del item antes de eliminar
 * - Confirmación explícita del usuario
 * - Redirección al listado tras la eliminación exitosa
 */
@Component({
  selector: 'app-routed-admin-remove-calinescu',
  imports: [UnroutedAdminViewCalinescu],
  templateUrl: './routed-admin-remove.html',
  styleUrl: './routed-admin-remove.css'
})
export class RoutedAdminRemoveCalinescu implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private calinescuService = inject(CalinescuService);

  /** Item a eliminar */
  oCalinescu: ICalinescu | null = null;
  
  /** Indica si se está cargando el item */
  loading: boolean = true;
  
  /** Mensaje de error si falla la carga o eliminación */
  error: string | null = null;
  
  /** Indica si se está ejecutando la operación de borrado */
  deleting: boolean = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID no válido';
      this.loading = false;
      return;
    }
    this.cargar(+id);
  }

  /**
   * Carga los datos del item a eliminar desde el servidor.
   * 
   * @param id - ID del item a cargar
   */
  cargar(id: number) {
    this.calinescuService.get(id).subscribe({
      next: (data: ICalinescu) => {
        this.oCalinescu = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error cargando el item';
        this.loading = false;
        if (debug) console.error(err);
      }
    });
  }

  /**
   * Ejecuta la eliminación del item tras la confirmación del usuario.
   * Redirige al listado si la operación es exitosa.
   */
  confirmarBorrado() {
    if (!this.oCalinescu) return;
    this.deleting = true;
    this.calinescuService.delete(this.oCalinescu.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/calinescu/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.deleting = false;
        this.error = 'Error borrando el item';
        if (debug) console.error(err);
      }
    });
  }

  /**
   * Cancela la operación de eliminación y vuelve al listado.
   */
  cancelar() {
    this.router.navigate(['/calinescu/plist']);
  }
}
