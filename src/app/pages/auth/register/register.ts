// src/app/pages/auth/register/register.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  registerForm = new FormGroup({
    usuario: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    direccion: new FormControl('', [Validators.required]),
    telefono: new FormControl('', [Validators.required, Validators.minLength(10)]),
    nacimiento: new FormControl<Date | null>(null, [Validators.required, validarMayoriaEdad as any]),
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' | 'warn' | null = null;

  constructor(private authSvc: AuthService, private router: Router) {}

  limitarTelefono(event: any) {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    if (valor.length > 10) valor = valor.substring(0, 10);
    event.target.value = valor;
    this.registerForm.patchValue({ telefono: valor });
  }

  registrar() {
    this.mensaje = '';
    const v = this.registerForm.value;

    // 1. VALIDACIÓN DE EDAD ESPECÍFICA
    if (this.registerForm.get('nacimiento')?.hasError('menorDeEdad')) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Debes ser mayor de edad.';
      return;
    }

    // 2. VALIDACIÓN GENERAL
    if (this.registerForm.invalid) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Rellena todos los campos.';
      return;
    }

    if (v.password !== v.confirmPassword) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    // 3. ESTADO DE CARGA E INTENTO DE REGISTRO
    this.tipoMensaje = 'info';
    this.mensaje = 'Procesando...';

    this.authSvc.register(v).subscribe({
      next: (res) => {
        this.tipoMensaje = 'success';
        this.mensaje = '¡Cuenta creada!';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.tipoMensaje = 'error';
        // Captura el mensaje directo y corto del backend
        this.mensaje = err.error?.data?.message || 'Error de conexión.';
      }
    });
  }
}

/**
 * Validador para asegurar que el usuario tenga al menos 18 años
 */
function validarMayoriaEdad(control: FormControl) {
  if (!control.value) return null;
  const fechaNacimiento = new Date(control.value);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }
  
  // Retorna error si es menor de 18 o si la fecha es hoy/futura
  return edad < 18 ? { menorDeEdad: true } : null;
}