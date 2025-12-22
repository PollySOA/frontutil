import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedUserView} from "../reyna-unrouted-user-view/unrouted-user-view";
import { IReyna } from '../../../model/reyna';
import { ReynaService } from '../../../service/reyna/reyna';

@Component({
  selector: 'app-routed-user-view',
  imports: [UnroutedUserView],
  templateUrl: './routed-user-view.html',
  styleUrls: ['./routed-user-view.css'],
})
export class RoutedUserView {
  oReyna: IReyna | null = null;

  constructor(private oReynaService: ReynaService, private route: ActivatedRoute) {
    // Obtener el ID de la frase motivacional desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    const reynaId = idParam ? Number(idParam) : NaN;
    if (isNaN(reynaId)) {
      console.error('Invalid reyna id:', idParam);
      return;
    }
    this.getReyna(reynaId);
  }

  ngOnInit() { }

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
