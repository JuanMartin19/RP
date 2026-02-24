import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}
