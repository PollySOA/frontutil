import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ISoares } from '../../../model/soares/soares';
import { SoaresService } from '../../../service/soares';

@Component({
  selector: 'app-soares-routed-user-view',
  imports: [RouterLink],
  templateUrl: './routed-user-view.html',
  styleUrl: './routed-user-view.css',
})
export class SoaresRoutedUserView {
  oSoares: ISoares | null = null;

  constructor(private oSoaresService: SoaresService, private route: ActivatedRoute) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const soaresId = idParam ? Number(idParam) : NaN;
    if (isNaN(soaresId)) {
      console.error('Invalid soares id:', idParam);
      return;
    }
    this.getSoares(soaresId);
  }

  ngOnInit() { }

  getSoares(soaresId: number) {
    this.oSoaresService.getOne(soaresId).subscribe({
      next: (data: ISoares) => {
        this.oSoares = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching soares:', error);
      },
    });
  }
}
