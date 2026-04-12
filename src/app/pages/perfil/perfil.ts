// src/app/pages/perfil/perfil.ts
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from "../../prime-imports";
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [PrimeImportsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  usuarioId: number | null = null;

  fechaMaxNacimiento: Date = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  })();

  perfilForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    usuario: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl({ value: '', disabled: true }), 
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    direccion: new FormControl(''),
    telefono: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
    nacimiento: new FormControl<Date | null>(null, [this.validarMayoriaEdad])
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' | null = null;
  cargando = false;
  
  // Variables de estado de carga separadas para form y stats
  cargandoDatos = true;
  cargandoStats = true;

  stats = [
    { titulo: 'Pendientes', valor: 0, class: 'bg-blue' },
    { titulo: 'En Progreso', valor: 0, class: 'bg-yellow' },
    { titulo: 'Completados', valor: 0, class: 'bg-green' }
  ];

  misTickets: any[] = [];

  constructor(
    private authSvc: AuthService,
    private usuariosSvc: UsuariosService,
    private ticketSvc: TicketService
  ) {}

  ngOnInit() {
    const user = this.authSvc.getUser();
    if (!user) return;

    this.usuarioId = user.id || user.sub;

    // 1. Cargar datos personales del usuario
    this.usuariosSvc.getById(this.usuarioId!).subscribe({
      next: (res: any) => {
        const u = res.data;
        this.perfilForm.patchValue({
          nombre: u.nombre_completo,
          usuario: u.username,
          email: u.email,
          direccion: u.direccion || '',
          telefono: u.telefono || ''
        });
        this.cargandoDatos = false;
      },
      error: () => {
        this.cargandoDatos = false;
      }
    });

    // 2. Cargar tickets asignados y estadísticas reales
    this.cargarEstadisticasReal();
  }

  cargarEstadisticasReal() {
    const miId = this.usuarioId || this.authSvc.getUser()?.id;
    if (!miId) return;

    this.cargandoStats = true;

    // Endpoint mágico: grupo 'all' filtrado por asignado_id
    this.ticketSvc.getTicketsByGroup('all', { asignado_id: miId }).subscribe({
      next: (res: any) => {
        this.misTickets = Array.isArray(res.data) ? res.data : [];
        
        this.stats = [
          { 
            titulo: 'Pendientes', 
            valor: this.misTickets.filter(t => t.estado === 'Pendiente').length, 
            class: 'bg-blue' 
          },
          { 
            titulo: 'En Progreso', 
            valor: this.misTickets.filter(t => t.estado === 'En Progreso').length, 
            class: 'bg-yellow' 
          },
          { 
            titulo: 'Completados', 
            valor: this.misTickets.filter(t => t.estado === 'Completado').length, 
            class: 'bg-green' 
          }
        ];
        this.cargandoStats = false;
      },
      error: (err) => {
        console.error("Error cargando tickets:", err);
        this.cargandoStats = false;
      }
    });
  }

  validarMayoriaEdad(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const fechaNacimiento = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
    return edad < 18 ? { menorDeEdad: true } : null;
  }

  limitarTelefono(event: any) {
    let valor = event.target.value.replace(/[^0-9]/g, '');
    if (valor.length > 10) valor = valor.substring(0, 10);
    event.target.value = valor;
    this.perfilForm.patchValue({ telefono: valor });
  }

  getPrioridadSeverity(prio: string): any {
    if (prio === 'Urgente' || prio === 'Alta') return 'danger';
    if (prio === 'Media') return 'warn';
    if (prio === 'Baja') return 'info';
    return 'secondary';
  }

  getEstadoSeverity(estado: string): any {
    switch (estado) {
      case 'Completado': return 'success';
      case 'En Progreso': return 'info';
      case 'Pendiente': return 'warn';
      default: return 'secondary';
    }
  }

  guardarCambios() {
    this.mensaje = '';
    this.perfilForm.markAllAsTouched();
    const v = this.perfilForm.getRawValue();

    if (!this.usuarioId || this.perfilForm.invalid) return;

    const payload: any = {
      nombre_completo: v.nombre,
      username: v.usuario,
      direccion: v.direccion || null,
      telefono: v.telefono || null
    };

    // SOLO enviamos la contraseña si el usuario escribió una nueva
    if (v.password && v.password.trim() !== '') {
      payload.password = v.password;
    }

    this.cargando = true;
    this.tipoMensaje = 'info';
    this.mensaje = 'Guardando cambios...';

    this.usuariosSvc.update(this.usuarioId, payload).subscribe({
      next: () => {
        this.cargando = false;
        this.tipoMensaje = 'success';
        this.mensaje = 'Perfil actualizado correctamente.';
        
        // Limpiamos los campos de password por seguridad
        this.perfilForm.patchValue({ password: '', confirmPassword: '' });
        this.perfilForm.markAsUntouched();
        
        const userActual = this.authSvc.getUser();
        this.authSvc.setCookie('user', JSON.stringify({
          ...userActual,
          nombre_completo: v.nombre,
          username: v.usuario
        }), 8);
      },
      error: (err) => {
        this.cargando = false;
        this.tipoMensaje = 'error';
        this.mensaje = err.error?.data?.message || 'Error al actualizar perfil.';
      }
    });
  }
}