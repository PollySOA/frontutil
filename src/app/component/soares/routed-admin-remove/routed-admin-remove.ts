import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SoaresService } from '../../../service/soares';
import { ISoares } from '../../../model/soares/soares';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminViewSoares } from "../unrouted-admin-view/unrouted-admin-view";

@Component({
  selector: 'app-soares-routed-admin-remove',
  imports: [UnroutedAdminViewSoares],
  templateUrl: './routed-admin-remove.html',
  styleUrl: './routed-admin-remove.css'
})
export class SoaresRoutedAdminRemove implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private soaresService = inject(SoaresService);

  oSoares: ISoares | null = null;
  loading: boolean = true;
  error: string | null = null;
  deleting: boolean = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

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
    this.soaresService.getOne(id).subscribe({
      next: (data: ISoares) => {
        this.oSoares = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error cargando la pregunta';
        this.loading = false;
        console.error(err);
      }
    });
  }

  confirmDelete() {
    if (!this.oSoares) return;
    this.deleting = true;
    this.soaresService.removeOne(this.oSoares.id).subscribe({
      next: () => {
        this.deleting = false;
        this.mostrarToast('Pregunta eliminada correctamente', 'success');
        setTimeout(() => {
          this.router.navigate(['/soares/admin/plist']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.deleting = false;
        this.error = 'Error al eliminar la pregunta';
        this.mostrarToast('Error al eliminar la pregunta', 'error');
        console.error(err);
      },
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    setTimeout(() => this.toastMessage = null, 2000);
  }

  cancel() {
    this.router.navigate(['/soares/admin/plist']);
  }
}
