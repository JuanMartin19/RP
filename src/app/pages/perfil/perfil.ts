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
    email: new FormControl({ value: '', disabled: true }), // email no editable
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    direccion: new FormControl(''),
    telefono: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
    nacimiento: new FormControl<Date | null>(null, [this.validarMayoriaEdad])
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' | null = null;
  cargando = false;
  cargandoDatos = true;

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

    this.usuarioId = user.id;

    // Cargar datos reales del usuario
    this.usuariosSvc.getById(user.id).subscribe({
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

  getPrioridadSeverity(prio: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (prio === 'Alta') return 'danger';
    if (prio === 'Media') return 'warn';
    return 'secondary';
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
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

    const v = this.perfilForm.value;

    // Validar contraseña solo si quiere cambiarla
    if (v.password || v.confirmPassword) {
      if ((v.password || '').length < 6) {
        this.tipoMensaje = 'error';
        this.mensaje = 'La contraseña debe tener mínimo 6 caracteres.';
        return;
      }
      if (v.password !== v.confirmPassword) {
        this.tipoMensaje = 'error';
        this.mensaje = 'Las contraseñas no coinciden.';
        return;
      }
    }

    // Validar mayoría de edad si puso fecha
    if (this.perfilForm.get('nacimiento')?.hasError('menorDeEdad')) {
      this.tipoMensaje = 'error';
      this.mensaje = 'Debes ser mayor de 18 años.';
      return;
    }

    if (!this.usuarioId) return;

    const payload: any = {
      nombre_completo: v.nombre,
      username: v.usuario,
      direccion: v.direccion || null,
      telefono: v.telefono || null
    };

    this.cargando = true;
    this.tipoMensaje = 'info';
    this.mensaje = 'Guardando cambios...';

    this.usuariosSvc.update(this.usuarioId, payload).subscribe({
      next: () => {
        this.cargando = false;
        this.tipoMensaje = 'success';
        this.mensaje = 'Perfil actualizado correctamente.';
        // Actualizar cookie del usuario
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