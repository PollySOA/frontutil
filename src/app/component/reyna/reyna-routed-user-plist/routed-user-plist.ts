import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { IPage } from '../../../model/plist';
import { IReyna } from '../../../model/reyna';
import { ReynaService } from '../../../service/reyna/reyna';
import { DatetimePipe } from '../../../pipe/datetime-pipe';

@Component({
  selector: 'app-routed-user-plist',
  imports: [DatetimePipe],
  templateUrl: './routed-user-plist.html',
  styleUrl: './routed-user-plist.css',
})
export class RoutedUserPlist {
  randomReyna: IReyna | null = null;
  loading: boolean = true;

  constructor(private oReynaService: ReynaService) {}

  ngOnInit() {
    this.getRandomPhrase();
  }

  getRandomPhrase() {
    // Obtener todas las frases (con un número grande de resultados por página)
    this.oReynaService.getPage(0, 1000, 'fechaCreacion', 'desc').subscribe({
      next: (data: IPage<IReyna>) => {
        // Filtrar solo frases públicas
        const publicReyna = data.content.filter((reyna) => reyna.esPublica);

        // Seleccionar una frase aleatoria
        if (publicReyna.length > 0) {
          const randomIndex = Math.floor(Math.random() * publicReyna.length);
          this.randomReyna = publicReyna[randomIndex];
        }

        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.loading = false;
      },
    });
  }

  reloadPhrase() {
    this.loading = true;
    this.getRandomPhrase();
  }
}
