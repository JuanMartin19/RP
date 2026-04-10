import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
    nombre: new FormControl('', [Validators.required]),
    usuario: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    direccion: new FormControl(''),
    telefono: new FormControl('', [Validators.minLength(10)]),
    nacimiento: new FormControl<Date | null>(null, [Validators.required, this.validarMayoriaEdad])
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' | 'warn' | null = null;
  cargando = false;

  fechaMaxNacimiento: Date = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  })();

  constructor(private authSvc: AuthService, private router: Router) {}

  // Validador estático — no necesita bind
  validarMayoriaEdad(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const fechaNacimiento = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad < 18 ? { menorDeEdad: true } : null;
  }

  limitarTelefono(event: any) {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    if (valor.length > 10) valor = valor.substring(0, 10);
    event.target.value = valor;
    this.registerForm.patchValue({ telefono: valor });
  }

  // Helpers para el HTML
  campo(nombre: string) {
    return this.registerForm.get(nombre);
  }

  campoInvalido(nombre: string): boolean {
    const c = this.campo(nombre);
    return !!(c?.invalid && c?.touched);
  }

  registrar() {
    this.mensaje = '';
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Rellena todos los campos obligatorios correctamente.';
      return;
    }

    const v = this.registerForm.value;

    if (v.password !== v.confirmPassword) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.tipoMensaje = 'info';
    this.mensaje = 'Procesando registro...';

    // nacimiento NO se envía al backend — solo fue validación local
    this.authSvc.register({
      nombre: v.nombre,
      usuario: v.usuario,
      email: v.email,
      password: v.password,
      direccion: v.direccion,
      telefono: v.telefono
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.tipoMensaje = 'success';
        this.mensaje = '¡Cuenta creada con éxito! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando = false;
        this.tipoMensaje = 'error';
        this.mensaje = err.error?.data?.message || 'Error al registrar usuario.';
      }
    });
  }
}