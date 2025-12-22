import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { SalinasService } from '../../../service/salinas-receta';
import { ISalinasReceta } from '../../../model/salinas-receta';
import { SalinasUnroutedAdminView } from '../unrouted-admin-view/unrouted-admin-view';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-salinas-routed-admin-remove',
  imports: [SalinasUnroutedAdminView],
  templateUrl: './routed-admin-remove.html',
  styleUrl: './routed-admin-remove.css'
})
export class SalinasRoutedAdminRemove implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private salinasService = inject(SalinasService);
  private snackBar = inject(MatSnackBar);

  oSalinasReceta: ISalinasReceta | null = null;
  loading: boolean = true;
  error: string | null = null;
  deleting: boolean = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID no válido';
      this.loading = false;
      return;
    }
    this.load(+id);
  }

  load(id: number) {
    this.salinasService.get(id).subscribe({
      next: (data: ISalinasReceta) => {
        this.oSalinasReceta = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error cargando el post';
        this.loading = false;
        console.error(err);
      }
    });
  }

  confirmDelete() {
    if (!this.oSalinasReceta) return;
    this.deleting = true;
    this.salinasService.delete(this.oSalinasReceta.id).subscribe({
      next: () => {
        this.deleting = false;
        this.snackBar.open('Receta borrada correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/receta/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.deleting = false;
        this.error = 'Error borrando la receta';
         this.snackBar.open('Error al borrar la receta', 'Cerrar', { duration: 4000 });
        console.error(err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/receta/plist']);
  }
}
