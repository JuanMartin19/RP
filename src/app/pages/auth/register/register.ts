import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  usuario = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  nombre = signal('');
  direccion = signal('');
  telefono = signal('');
  nacimiento = signal('');

  mensaje = signal('');
  tipoMensaje = signal<'success' | 'error' | ''>('');

  validarPassword(pass: string): boolean {
    const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;
    return regex.test(pass);
  }

  esMayorEdad(fecha: string): boolean {
    const nacimiento = new Date(fecha);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad >= 18;
  }

  registrar() {

    if (
      !this.usuario() ||
      !this.email() ||
      !this.password() ||
      !this.confirmPassword() ||
      !this.nombre() ||
      !this.direccion() ||
      !this.telefono() ||
      !this.nacimiento()
    ) {
      this.tipoMensaje.set('error');
      this.mensaje.set('Todos los campos son obligatorios');
      return;
    }

    if (!this.validarPassword(this.password())) {
      this.tipoMensaje.set('error');
      this.mensaje.set('La contraseña debe tener mínimo 10 caracteres y un símbolo especial: !@#$%^&*(),.?":{}|<>');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.tipoMensaje.set('error');
      this.mensaje.set('Las contraseñas no coinciden');
      return;
    }

    if (!/^[0-9]+$/.test(this.telefono())) {
      this.tipoMensaje.set('error');
      this.mensaje.set('El teléfono solo debe contener números');
      return;
    }

    if (!this.esMayorEdad(this.nacimiento())) {
      this.tipoMensaje.set('error');
      this.mensaje.set('Debes ser mayor de edad para registrarte');
      return;
    }

    this.tipoMensaje.set('success');
    this.mensaje.set('Registro exitoso 🎉');
  }
}