import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../prime-imports";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

}
