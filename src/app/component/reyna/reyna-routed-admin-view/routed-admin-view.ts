import { Component } from '@angular/core';
import { IReyna } from '../../../model/reyna';
import { ReynaService } from '../../../service/reyna/reyna';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminView } from '../reyna-unrouted-admin-view/unrouted-admin-view';

@Component({
  selector: 'app-routed-admin-view',
  imports: [UnroutedAdminView],
  templateUrl: './routed-admin-view.html',
  styleUrl: './routed-admin-view.css',
})
export class RoutedAdminView {
  oReyna: IReyna | null = null;

  constructor(private oReynaService: ReynaService, private route: ActivatedRoute) {
    // Obtener el ID desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    const reynaId = idParam ? Number(idParam) : NaN;
    if (isNaN(reynaId)) {
      console.error('Invalid reyna id:', idParam);
      return;
    }
    this.getReyna(reynaId);
  }

  ngOnInit() {}

  getReyna(reynaId: number) {
    this.oReynaService.get(reynaId).subscribe({
      next: (data: IReyna) => {
        this.oReyna = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching reyna:', error);
      },
    });
  }
}
