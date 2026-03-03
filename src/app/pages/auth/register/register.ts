import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  registerForm = new FormGroup({
    usuario: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    nombre: new FormControl(''),
    direccion: new FormControl(''),
    telefono: new FormControl(''),
    nacimiento: new FormControl<Date | null>(null),
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | null = null;

  limitarTelefono(event: any) {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    if (valor.length > 10) valor = valor.substring(0, 10);
    event.target.value = valor;
    this.registerForm.patchValue({ telefono: valor });
  }

  registrar() {
    // 0. LIMPIAR MENSAJES ANTERIORES
    this.mensaje = '';
    this.tipoMensaje = null;

    const v = this.registerForm.value;

    // 1. Validar que todos los campos estén llenos
    if (!v.usuario || !v.email || !v.password || !v.confirmPassword || 
        !v.nombre || !v.direccion || !v.telefono || !v.nacimiento) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    // 2. Validar usuario
    if (v.usuario.length < 4) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El usuario debe tener al menos 4 caracteres';
      return;
    }

    // 3. Validar correo
    const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const dominio = v.email.split('@')[1]?.toLowerCase();
    if (!dominio || !dominios.includes(dominio)) {
        this.tipoMensaje = 'error';
        this.mensaje = 'El correo debe ser válido (Gmail, Hotmail, Outlook o Yahoo)';
        return;
    }

    // 4. Validar contraseña
    const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;
    if (!regex.test(v.password || '')) {
      this.tipoMensaje = 'error';
      this.mensaje = 'La contraseña debe tener mínimo 10 caracteres y un símbolo especial';
      return;
    }

    if (v.password !== v.confirmPassword) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Las contraseñas no coinciden';
      return;
    }

    // 5. Validar teléfono EXACTO (10 dígitos)
    if (!v.telefono || v.telefono.length !== 10) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El teléfono debe tener exactamente 10 dígitos';
      return;
    }

    // 6. Validar mayor de edad (ÚLTIMO PASO)
    const hoy = new Date();
    const fechaNac = new Date(v.nacimiento); // Aseguramos que sea objeto Date
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesDiferencia = hoy.getMonth() - fechaNac.getMonth();
    
    if (mesDiferencia < 0 || (mesDiferencia === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    
    if (edad < 18) {
        this.tipoMensaje = 'error';
        this.mensaje = 'Debes ser mayor de edad para registrarte';
        return;
    }

    // Si todo pasa:
    this.tipoMensaje = 'success';
    this.mensaje = 'Registro exitoso';
  }
}