import { Component } from '@angular/core';
import { ICastanyera } from '../../../model/castanyera';
import { CastanyeraService } from '../../../service/castanyera';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CastanyeraUnroutedUserView } from '../castanyera-unrouted-user-view/unrouted-user-view';

@Component({
  selector: 'castanyera-app-routed-user-view',
  imports: [CastanyeraUnroutedUserView],
  templateUrl: './routed-user-view.html',
  styleUrls: ['./routed-user-view.css'],
})
export class CastanyeraRoutedUserView {
  oCastanyera: ICastanyera | null = null;
  isPrivate: boolean = false;

  constructor(private oCastanyeraService: CastanyeraService, private route: ActivatedRoute) {
    // Obtener el ID del journal desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    const castanyeraId = idParam ? Number(idParam) : NaN;
    if (isNaN(castanyeraId)) {
      console.error('Invalid journal id:', idParam);
      return;
    }
  this.getCastanyera(castanyeraId);
  }

  ngOnInit() {}

  getCastanyera(castanyeraId: number) {
    // Fetch only if public — backend should reject or return 404 for private entries
    this.oCastanyeraService.getIfPublic(castanyeraId).subscribe({
      next: (data: ICastanyera) => {
        this.oCastanyera = data;
        this.isPrivate = false;
      },
      error: (error: HttpErrorResponse) => {
        // If the server returns 404 or 403 treat as private
        if (error.status === 404 || error.status === 403) {
          this.oCastanyera = null;
          this.isPrivate = true;
        } else {
          console.error('Error fetching journal:', error);
        }
      },
    });
  }
}
