import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PavonService } from '../../../service/pavon/recurso';
import { IRecurso } from '../../../model/pavon/recurso';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminViewPavon } from "../unrouted-admin-view/unrouted-admin-view";

@Component({
  selector: 'app-routed-admin-remove',
  imports: [UnroutedAdminViewPavon],
  templateUrl: './routed-admin-remove.html',
  styleUrl: './routed-admin-remove.css'
})
export class RoutedAdminRemovePavon implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pavonService = inject(PavonService);

  oRecurso: IRecurso | null = null;
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
    this.pavonService.get(id).subscribe({
      next: (data: IRecurso) => {
        this.oRecurso = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error cargando el recurso';
        this.loading = false;
        console.error(err);
      }
    });
  }

  confirmDelete() {
    if (!this.oRecurso) return;
    this.deleting = true;
    this.pavonService.delete(this.oRecurso.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/recurso/plist'], { queryParams: { msg: 'Recurso borrado correctamente' } });
      },
      error: (err: HttpErrorResponse) => {
        this.deleting = false;
        this.error = 'Error borrando el recurso';
        console.error(err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/recurso/plist']);
  }
}
