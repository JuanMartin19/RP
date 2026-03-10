import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { PrimeImportsModule } from "../../prime-imports";

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {

  perfilForm = new FormGroup({
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

  ngOnInit() {
    // Simulación datos cargados
    this.perfilForm.patchValue({
      usuario: 'StArCk',
      email: '2023371152@uteq.edu.mx',
      nombre: 'Juan Martín',
      direccion: 'Querétaro, México',
      telefono: '4421234567',
      nacimiento: new Date(2000, 5, 15)
    });
  }

  limitarTelefono(event: any) {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    if (valor.length > 10) valor = valor.substring(0, 10);
    event.target.value = valor;
    this.perfilForm.patchValue({ telefono: valor });
  }

  guardarCambios() {
    this.mensaje = '';
    this.tipoMensaje = null;

    const v = this.perfilForm.value;

    // 1️⃣ Campos obligatorios (menos contraseña porque puede no cambiarla)
    if (!v.usuario || !v.email || !v.nombre || 
        !v.direccion || !v.telefono || !v.nacimiento) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Todos los campos son obligatorios';
      return;
    }

    // 2️⃣ Usuario mínimo 4 caracteres
    if (v.usuario.length < 4) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El usuario debe tener al menos 4 caracteres';
      return;
    }

    // 3️⃣ Validar dominio correo
    const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
    const dominio = v.email.split('@')[1]?.toLowerCase();
    if (!dominio || !dominios.includes(dominio)) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Correo inválido (Gmail, Hotmail, Outlook o Yahoo)';
      return;
    }

    // 4️⃣ Validar contraseña SOLO si quiere cambiarla
    if (v.password || v.confirmPassword) {
      const regex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;

      if (!regex.test(v.password || '')) {
        this.tipoMensaje = 'error';
        this.mensaje = 'La contraseña debe tener mínimo 10 caracteres y un símbolo';
        return;
      }

      if (v.password !== v.confirmPassword) {
        this.tipoMensaje = 'error';
        this.mensaje = 'Las contraseñas no coinciden';
        return;
      }
    }

    // 5️⃣ Teléfono exacto 10 dígitos
    if (!v.telefono || v.telefono.length !== 10) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El teléfono debe tener 10 dígitos';
      return;
    }

    // 6️⃣ Validar mayoría de edad
    const hoy = new Date();
    const fechaNac = new Date(v.nacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesDiff = hoy.getMonth() - fechaNac.getMonth();

    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 18) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Debes ser mayor de edad';
      return;
    }

    this.tipoMensaje = 'success';
    this.mensaje = 'Perfil actualizado correctamente';
  }
}