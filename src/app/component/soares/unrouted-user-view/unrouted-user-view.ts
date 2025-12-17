import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ISoares } from '../../../model/soares/soares';

@Component({
  selector: 'app-unrouted-user-view-soares',
  imports: [RouterLink],
  templateUrl: './unrouted-user-view.html',
  styleUrl: './unrouted-user-view.css',
})
export class UnroutedUserViewSoares {
  @Input() oSoares: ISoares | null = null;
}
