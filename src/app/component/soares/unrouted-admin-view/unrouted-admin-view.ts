import { Component, Input } from '@angular/core';
import { ISoares } from '../../../model/soares/soares';

@Component({
  selector: 'app-unrouted-admin-view-soares',
  imports: [],
  templateUrl: './unrouted-admin-view.html',
  styleUrl: './unrouted-admin-view.css',
})
export class UnroutedAdminViewSoares {
  @Input() oSoares: ISoares | null = null;
}
