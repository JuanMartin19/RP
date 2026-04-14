// src/app/pages/ticket/ticket.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { PrimeImportsModule } from '../../prime-imports';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule, CommonModule],
  providers: [MessageService],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class Ticket implements OnInit {

  tickets: any[] = [];
  miembros: any[] = [];
  ticketDialog = false;
  editingId: number | null = null;
  cargando = true;
  groupId: string | null = null;

  ticketForm = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl('Pendiente', { nonNullable: true }),
    prioridad: new FormControl('Media', { nonNullable: true }),
    autor: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true }),
    asignado_id: new FormControl<number | null>(null),
    fecha_limite: new FormControl<Date | null>(null)
  });

  canView = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private ticketSvc: TicketService,
    private authSvc: AuthService,
    private messageSvc: MessageService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.groupId = this.route.parent?.snapshot.paramMap.get('id') || null;

    if (this.groupId) {
      this.validarPermisosEstrictos(); // <-- Usamos la nueva lógica literal
      
      if (this.canView) {
        this.cargarTicketsDelGrupo();
        this.cargarMiembros();
      } else {
        this.cargando = false;
      }
    }
  }

  // NUEVA LÓGICA: 100% LITERAL. Si no está en la lista asignada, no hay botón.
  validarPermisosEstrictos() {
    const token = this.authSvc.getToken();
    if (!token) return;
    
    const payload = this.authSvc.extraerPermisosDelToken(token);
    const globales = payload.global || [];
    const delGrupo = (payload.grupos && payload.grupos[this.groupId!]) ? payload.grupos[this.groupId!] : [];

    const tienePermisoExacto = (permiso: string) => {
      return globales.includes(permiso) || delGrupo.includes(permiso);
    };

    this.canView = tienePermisoExacto('ticket:view');
    this.canAdd = tienePermisoExacto('ticket:add');
    this.canEdit = tienePermisoExacto('ticket:edit');
    this.canDelete = tienePermisoExacto('ticket:delete');
  }

  cargarTicketsDelGrupo() {
    this.cargando = true;
    this.ticketSvc.getTicketsByGroup(this.groupId!).subscribe({
      next: (res: any) => {
        this.tickets = res.data || [];
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarMiembros() {
    const token = this.authSvc.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get(`${environment.apiUrl}/groups/${this.groupId}`, { headers }).subscribe({
      next: (res: any) => {
        if (res.data && res.data.miembros) {
          this.miembros = res.data.miembros.map((m: any) => m.usuarios);
        }
      }
    });
  }

  saveTicket() {
    if (this.ticketForm.invalid) {
      this.messageSvc.add({ severity: 'warn', summary: 'Atención', detail: 'Completa los campos obligatorios.' });
      return;
    }
    if (!this.groupId) return;

    const data = this.ticketForm.getRawValue();
    let fechaAEnviar = null;
    if (data.fecha_limite) {
      fechaAEnviar = new Date(data.fecha_limite).toISOString();
    }
    
    const payload: any = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      grupo_id: Number(this.groupId),
      asignado_id: data.asignado_id,
      fecha_limite: fechaAEnviar
    };

    if (this.editingId) {
      if (!this.canEdit) return;
      this.ticketSvc.updateTicket(this.editingId, payload).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket actualizado' });
          this.cargarTicketsDelGrupo();
          this.ticketDialog = false;
        },
        error: (err) => {
          this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al editar' });
        }
      });
    } else {
      if (!this.canAdd) return;
      this.ticketSvc.createTicket(payload).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket creado' });
          this.cargarTicketsDelGrupo();
          this.ticketDialog = false;
        },
        error: (err) => {
          this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al crear' });
        }
      });
    }
  }

  editTicket(ticket: any) {
    if (!this.canEdit) return;
    this.editingId = ticket.id;
    this.ticketForm.patchValue({
      titulo: ticket.titulo,
      estado: ticket.estado,
      prioridad: ticket.prioridad,
      autor: ticket.autor?.nombre_completo || 'Sin autor',
      descripcion: ticket.descripcion,
      asignado_id: ticket.asignado?.id || null,
      fecha_limite: ticket.fecha_limite ? new Date(ticket.fecha_limite) : null
    });
    this.ticketDialog = true;
  }

  deleteTicket(id: number) {
    if (!this.canDelete) return;
    if (!confirm('¿Seguro que deseas eliminar este ticket?')) return;
    
    this.ticketSvc.deleteTicket(id, this.groupId!).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t.id !== id);
        this.messageSvc.add({ severity: 'success', summary: 'Eliminado', detail: 'Ticket borrado' });
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'No se pudo eliminar' });
      }
    });
  }

  getEstadoSeverity(estado: string): any {
    if (estado === 'Pendiente') return 'warn';
    if (estado === 'En Progreso') return 'info';
    return 'success';
  }

  getPrioridadSeverity(prioridad: string): any {
    if (prioridad === 'Alta') return 'danger';
    if (prioridad === 'Media') return 'warn';
    return 'info';
  }

  openNew() {
    if (!this.canAdd) return;
    const user = this.authSvc.getUser();
    this.ticketForm.reset({ 
      estado: 'Pendiente', 
      prioridad: 'Media',
      autor: user?.nombre_completo || 'Usuario',
      asignado_id: null,
      fecha_limite: null
    });
    this.editingId = null;
    this.ticketDialog = true;
  }
}