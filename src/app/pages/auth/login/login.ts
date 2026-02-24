import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');

  private readonly USER = {
    email: 'admin@gmail.com',
    password: 'Admin123'
  };

  constructor(private router: Router) {}

  login() {
    if (
      this.email() === this.USER.email &&
      this.password() === this.USER.password
    ) {
      alert('Login correcto');
      this.router.navigate(['/landing']);
    } else {
      alert('Tu correo o contraseñ esta incorrecta');
    }
  }
}