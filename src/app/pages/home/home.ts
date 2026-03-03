import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../prime-imports";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}