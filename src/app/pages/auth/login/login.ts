import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  private readonly ADMIN_USER = {
    email: 'admin@gmail.com',
    password: 'admin'
  };

  constructor(private router: Router) {}

  login() {
    const v = this.loginForm.value;

    if (v.email === this.ADMIN_USER.email && v.password === this.ADMIN_USER.password) {
      alert('Login correcto');
      this.router.navigate(['/home']);
    } else {
      alert('Tu correo o contraseña están incorrectos');
    }
  }
}