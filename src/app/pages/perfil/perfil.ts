import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from "../../prime-imports";

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
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

  // Datos para las estadísticas de la derecha
  stats = [
    { titulo: 'Abiertos', valor: 1, class: 'bg-blue' },
    { titulo: 'En Progreso', valor: 1, class: 'bg-yellow' },
    { titulo: 'Hechos', valor: 1, class: 'bg-green' }
  ];

  // Datos para la tabla de tickets
  misTickets: any[] = [];

  ngOnInit() {
    // Simulación datos cargados del usuario
    this.perfilForm.patchValue({
      usuario: 'draken',
      email: 'jonathan@ejemplo.com',
      nombre: 'Jonathan',
      direccion: 'De la Lealtad 23',
      telefono: '4411625463',
      nacimiento: new Date(2000, 5, 15) // Fecha simulada para ser > 18
    });

    // Simulación datos para la tabla
    this.misTickets = [
      { id: 'TK-101', titulo: 'Corregir API Login', prioridad: 'Alta', estado: 'En progreso' },
      { id: 'TK-105', titulo: 'Diseño de Perfil', prioridad: 'Media', estado: 'Hecho' },
      { id: 'TK-110', titulo: 'Testing de Seguridad', prioridad: 'Alta', estado: 'Pendiente' }
    ];
  }

  limitarTelefono(event: any) {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    if (valor.length > 10) valor = valor.substring(0, 10);
    event.target.value = valor;
    this.perfilForm.patchValue({ telefono: valor });
  }

  getPrioridadClass(prio: string): string {
    if (prio === 'Alta') return 'prio-alta';
    if (prio === 'Media') return 'prio-media';
    return 'prio-baja';
  }

  getEstadoSeverity(estado: string): any {
    switch (estado) {
      case 'Hecho': return 'success';
      case 'En progreso': return 'info';
      case 'Pendiente': return 'warning';
      default: return 'secondary';
    }
  }

  guardarCambios() {
    this.mensaje = '';
    this.tipoMensaje = null;
    const v = this.perfilForm.value;

    // 1️⃣ Campos obligatorios (menos contraseña)
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
    const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'ejemplo.com'];
    const dominio = v.email.split('@')[1]?.toLowerCase();
    if (!dominio || !dominios.includes(dominio)) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Correo inválido (Gmail, Hotmail, Outlook, Yahoo o ejemplo.com)';
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
    if (v.nacimiento) {
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
    }

    this.tipoMensaje = 'success';
    this.mensaje = 'Perfil actualizado correctamente';
  }
}