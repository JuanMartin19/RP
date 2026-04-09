// src/app/pages/auth/login/login.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";
import { PermissionsService } from '../../../services/permissions.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private router: Router,
    private permsSvc: PermissionsService,
    private authSvc: AuthService 
  ) { }

  login() {
    if (this.loginForm.invalid) {
      alert('Por favor, ingrese un correo válido y su contraseña');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authSvc.login(email!, password!).subscribe({
      next: (res) => {
        // 1. El token ya se guardó en el AuthService (vía el tap del pipe)
        console.log('Login exitoso:', res.data.user.nombre_completo);

        // 2. Cargamos permisos mínimos para entrar. 
        // En la siguiente fase, haremos un GET /profile para traer sus permisos reales de la DB
        this.permsSvc.setPermissions(['group:view', 'ticket:view']); 

        // 3. Navegamos al home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error en login', err);
        alert(err.error?.data?.message || 'Error al iniciar sesión');
      }
    });
  }
}