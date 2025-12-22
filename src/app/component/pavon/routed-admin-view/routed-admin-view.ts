import { Component } from '@angular/core';
import { IRecurso } from '../../../model/pavon/recurso';
import { PavonService } from '../../../service/pavon/recurso';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminViewPavon } from "../unrouted-admin-view/unrouted-admin-view";

@Component({
  selector: 'app-routed-admin-view',
  imports: [UnroutedAdminViewPavon, RouterLink],
  templateUrl: './routed-admin-view.html',
  styleUrl: './routed-admin-view.css',
})
export class RoutedAdminViewPavon {
  oRecurso: IRecurso | null = null;

  constructor(private oPavonService: PavonService, private route: ActivatedRoute) {
    // Obtener el ID del recurso desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    const recursoId = idParam ? Number(idParam) : NaN;
    if (isNaN(recursoId)) {
      console.error('Invalid recurso id:', idParam);
      return;
    }
    this.getRecurso(recursoId);
  }

  ngOnInit() { }

  getRecurso(recursoId: number) {
    this.oPavonService.get(recursoId).subscribe({
      next: (data: IRecurso) => {
        this.oRecurso = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching recurso:', error);
      },
    });
  }
}
