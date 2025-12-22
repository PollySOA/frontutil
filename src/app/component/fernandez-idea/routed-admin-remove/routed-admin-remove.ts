import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FernandezIdeaService } from '../../../service/fernandez-idea.service';
import { IFernandezIdea } from '../../../model/fernandez-idea';
import { HttpErrorResponse } from '@angular/common/http';
import { FernandezUnroutedAdminView } from "../unrouted-admin-view/unrouted-admin-view";
import { debug } from '../../../environment/environment';

@Component({
  selector: 'app-fernandez-routed-admin-remove',
  imports: [FernandezUnroutedAdminView],
  templateUrl: './routed-admin-remove.html',
  styleUrl: './routed-admin-remove.css'
})
export class FernandezRoutedAdminRemove implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ideaService = inject(FernandezIdeaService);
  protected readonly debugging = debug;

  oIdea: IFernandezIdea | null = null;
  loading: boolean = true;
  error: string | null = null;
  deleting: boolean = false;
  info: string | null = null;

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
    this.ideaService.get(id).subscribe({
      next: (data: IFernandezIdea) => {
        this.oIdea = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error cargando la idea';
        this.loading = false;
        this.debugging && console.error(err);
      }
    });
  }

  confirmDelete() {
    if (!this.oIdea) return;

    const ok = confirm(
      `BORRADO IRREVERSIBLE.\n\n¿Seguro que deseas borrar la idea "${this.oIdea.titulo}" (ID ${this.oIdea.id})?`
    );
    if (!ok) {
      return;
    }

    this.deleting = true;
    this.info = null;
    this.error = null;
    this.ideaService.delete(this.oIdea.id).subscribe({
      next: () => {
        this.deleting = false;
        this.info = 'Idea borrada correctamente.';
        // pequeña pausa para que el usuario vea el mensaje
        setTimeout(() => this.router.navigate(['/fernandez-idea/admin/plist']), 700);
      },
      error: (err: HttpErrorResponse) => {
        this.deleting = false;
        this.error = 'Error borrando la idea';
        this.debugging && console.error(err);
      }
    });
  }

  cancel() {
    this.router.navigate(['/fernandez-idea/admin/plist']);
  }
}
