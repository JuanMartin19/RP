import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";
import { AuthService } from '../../../services/auth.service';
import { PermissionsService } from '../../../services/permissions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' | 'warn' | null = null;
  cargando = false;
  logoClickCount = 0;

  constructor(
    private router: Router,
    private authSvc: AuthService,
    private permsSvc: PermissionsService
  ) {}

  ngOnInit() {
    if (this.authSvc.isLoggedIn()) {
      const token = this.authSvc.getToken()!;
      const permisos = this.authSvc.extraerPermisosDelToken(token);
      this.permsSvc.setPermissions(permisos);
      this.router.navigate(['/home']);
    }
  }

  onLogoClick() {
    this.logoClickCount++;
    if (this.logoClickCount >= 5) {
      this.logoClickCount = 0;
      this.tipoMensaje = 'warn';
      this.mensaje = 'catch u 👀';
    }
  }

  login() {
    this.mensaje = '';
    if (this.loginForm.invalid) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Ingresa correo y contraseña válidos.';
      return;
    }

    const { email, password } = this.loginForm.value;
    this.cargando = true;
    this.tipoMensaje = 'info';
    this.mensaje = 'Validando credenciales...';

    this.authSvc.login(email!, password!).subscribe({
      next: () => {
        this.cargando = false;
        this.tipoMensaje = 'success';
        this.mensaje = '¡Bienvenido! Entrando...';
        setTimeout(() => this.router.navigate(['/home']), 1000);
      },
      error: (err) => {
        this.cargando = false;
        this.tipoMensaje = 'error';
        this.mensaje = err.error?.data?.message || 'Credenciales incorrectas o error de servidor.';
      }
    });
  }
}