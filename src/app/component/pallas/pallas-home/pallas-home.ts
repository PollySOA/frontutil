import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PallasPreview } from "../pallas-preview/pallas-preview";

@Component({
  selector: 'app-pallas-home',
  imports: [RouterLink, PallasPreview],
  templateUrl: './pallas-home.html',
  styleUrls: ['./pallas-home.css'],
  standalone: true
})
export class PallasHome  {

}
