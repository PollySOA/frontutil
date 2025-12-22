import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReynaService } from '../../../service/reyna/reyna';
import { IReyna } from '../../../model/reyna';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminView } from '../reyna-unrouted-admin-view/unrouted-admin-view';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-routed-admin-remove',
  imports: [UnroutedAdminView],
  templateUrl: './routed-admin-remove.html',
  styleUrl: './routed-admin-remove.css',
})
export class RoutedAdminRemove implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reynaService = inject(ReynaService);
  private snackBar = inject(MatSnackBar);

  oReyna: IReyna | null = null;
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
    this.reynaService.get(id).subscribe({
      next: (data: IReyna) => {
        this.oReyna = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error cargando la frase motivacional';
        this.loading = false;
        console.error(err);
      },
    });
  }

  confirmDelete() {
    if (!this.oReyna) return;
    this.deleting = true;
    this.reynaService.delete(this.oReyna.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/reyna/plist']);
        // notificar
        this.snackBar.open('Frase motivacional borrada', 'Cerrar', { duration: 3000 });
      },
      error: (err: HttpErrorResponse) => {
        this.deleting = false;
        this.error = 'Error borrando la frase motivacional';
        console.error(err);
      },
    });
  }

  cancel() {
    this.router.navigate(['/reyna/plist']);
  }
}
