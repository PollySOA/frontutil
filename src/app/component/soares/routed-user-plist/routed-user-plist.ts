import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IPage } from '../../../model/plist';
import { ISoares } from '../../../model/soares/soares';
import { SoaresService } from '../../../service/soares';
import { Paginacion } from "../../shared/paginacion/paginacion";
import { UnroutedUserViewSoares } from "../unrouted-user-view/unrouted-user-view";

@Component({
  selector: 'app-soares-routed-user-plist',
  imports: [RouterLink, Paginacion, UnroutedUserViewSoares],
  templateUrl: './routed-user-plist.html',
  styleUrl: './routed-user-plist.css',
})
export class SoaresRoutedUserPlist {
  oPage: IPage<ISoares> | null = null;
  numPage: number = 0;
  numRpp: number = 2;

  constructor(private oSoaresService: SoaresService) { }

  oBotonera: string[] = [];

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.oSoaresService.getPageUser(this.numPage, this.numRpp, 'fechaCreacion', 'desc').subscribe({
      next: (data: IPage<ISoares>) => {
        this.oPage = data;
        if (this.numPage > 0 && this.numPage >= data.totalPages) {
          this.numPage = data.totalPages - 1;
          this.getPage();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      },
    });
  }

  goToPage(numPage: number) {
    this.numPage = numPage;
    this.getPage();
    return false;
  }

  onRppChange(n: number) {
    this.numRpp = n;
    this.getPage();
  }
}
