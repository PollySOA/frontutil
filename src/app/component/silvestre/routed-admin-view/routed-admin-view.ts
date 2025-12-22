import { Component } from '@angular/core';
import { ISilvestre } from '../../../model/silvestre';
import { SilvestreService } from '../../../service/silvestre';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminView } from "../unrouted-admin-view/unrouted-admin-view";


@Component({
  selector: 'app-routed-admin-view',
  imports: [UnroutedAdminView, RouterLink],
  templateUrl: './routed-admin-view.html',
  styleUrl: './routed-admin-view.css',
})
export class RoutedAdminView {
  oSilvestre: ISilvestre | null = null;

  constructor(private oSilvestreService: SilvestreService, private route: ActivatedRoute) {
    // Obtener el ID de la publi desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    const silvestreId = idParam ? Number(idParam) : NaN;
    if (isNaN(silvestreId)) {
      console.error('Invalid blog id:', idParam);
      return;
    }
    this.getSilvestre(silvestreId);
  }

  ngOnInit() { }

  getSilvestre(silvestreId: number) {
    this.oSilvestreService.get(silvestreId).subscribe({
      next: (data: ISilvestre) => {
        this.oSilvestre = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching silvestre:', error);
      },
    });
  }
}
