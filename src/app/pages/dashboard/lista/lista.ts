// src/app/pages/dashboard/lista/lista.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PrimeImportsModule } from '../../../prime-imports';
import { PermissionsService } from '../../../services/permissions.service';
import { TicketService } from '../../../services/ticket.service';
import { GroupsService } from '../../../services/groups.service';
import { AuthService } from '../../../services/auth.service';
import { DetalleTicket } from '../../../components/detalle-ticket/detalle-ticket';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule, DetalleTicket],
  providers: [MessageService, ConfirmationService],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista implements OnInit {

  usuarioActual: any = null;
  miId: number | null = null;
  groupId: string | null = null;
  grupoCreadorId: number | null = null;
  cargando = true;

  filtrosDisponibles = ['Todos', 'Mis tickets', 'Asignados a mi', 'Sin asignar', 'Prioridad Alta', 'Prioridad Media', 'Prioridad Baja', 'Completados'];
  filtroActivo = 'Todos';

  panelDetalleVisible = false;
  ticketSeleccionadoParaDetalle: any = null;

  estadosDisponibles = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Completado', value: 'Completado' }
  ];

  prioridades = ['Alta', 'Media', 'Baja'];
  estadosSinNulo = ['Pendiente', 'En Progreso', 'Completado'];

  tickets: any[] = [];
  ticketsMostrados: any[] = [];
  opcionesAsignado: any[] = []; 

  mostrarModal = false;
  ticketEditando: any = {};

  canEdit = false;
  canDelete = false;
  esAdmin = false; // <-- Nueva variable

  constructor(
    private route: ActivatedRoute,
    private permsSvc: PermissionsService,
    private ticketSvc: TicketService,
    private groupsSvc: GroupsService,
    private authSvc: AuthService,
    private messageSvc: MessageService,
    private confirmSvc: ConfirmationService
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authSvc.getUser();
    this.miId = this.usuarioActual?.id || null;
    this.groupId = this.route.parent?.snapshot.paramMap.get('id') || null;

    if (this.groupId) {
      this.validarPermisosEstrictos(); // <-- Validamos directo del token
      this.cargarUsuariosGrupo();
      this.cargarTicketsReal();
    }
  }

  // LECTURA ESTRICTA DEL TOKEN
  validarPermisosEstrictos() {
    const token = this.authSvc.getToken();
    if (!token) return;
    const payload = this.authSvc.extraerPermisosDelToken(token);
    const globales = payload.global || [];
    const delGrupo = (payload.grupos && payload.grupos[this.groupId!]) ? payload.grupos[this.groupId!] : [];

    const tienePermisoExacto = (permiso: string) => {
      return globales.includes(permiso) || delGrupo.includes(permiso);
    };

    this.canEdit = tienePermisoExacto('ticket:edit');
    this.canDelete = tienePermisoExacto('ticket:delete');
    // Evaluamos si es un administrador con poderes plenos
    this.esAdmin = tienePermisoExacto('ticket:manage') || tienePermisoExacto('group:manage');
  }

  cargarUsuariosGrupo() {
    this.groupsSvc.getGroupById(this.groupId!).subscribe({
      next: (res: any) => {
        this.grupoCreadorId = res.data?.creador_id || null;
        const miembros = res.data?.miembros || [];
        this.opcionesAsignado = [
          { label: 'Sin asignar', value: null },
          ...miembros.map((m: any) => ({
            label: m.usuarios.nombre_completo,
            value: m.usuarios.id
          }))
        ];
      }
    });
  }

  cargarTicketsReal() {
    this.cargando = true;
    this.ticketSvc.getTicketsByGroup(this.groupId!).subscribe({
      next: (res: any) => {
        const rawTickets = Array.isArray(res.data) ? res.data : [];
        this.tickets = rawTickets.map((t: any) => ({
          ...t,
          autor_id: t.autor?.id ?? null,
          asignado_id: t.asignado?.id ?? null,
          asignadoNombre: t.asignado?.nombre_completo ?? 'Sin asignar',
          fechaCreacion: new Date(t.creado_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        }));
        this.aplicarFiltroRapido(this.filtroActivo);
        this.cargando = false;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets.' });
        this.cargando = false;
      }
    });
  }

  aplicarFiltroRapido(filtro: string) {
    this.filtroActivo = filtro;
    switch (filtro) {
      case 'Todos': this.ticketsMostrados = [...this.tickets]; break;
      case 'Mis tickets': this.ticketsMostrados = this.tickets.filter(t => t.autor_id == this.miId); break;
      case 'Asignados a mi': this.ticketsMostrados = this.tickets.filter(t => t.asignado_id == this.miId); break;
      case 'Sin asignar': this.ticketsMostrados = this.tickets.filter(t => !t.asignado_id); break;
      case 'Prioridad Alta': this.ticketsMostrados = this.tickets.filter(t => t.prioridad === 'Alta'); break;
      case 'Prioridad Media': this.ticketsMostrados = this.tickets.filter(t => t.prioridad === 'Media'); break;
      case 'Prioridad Baja': this.ticketsMostrados = this.tickets.filter(t => t.prioridad === 'Baja'); break;
      case 'Completados': this.ticketsMostrados = this.tickets.filter(t => t.estado === 'Completado'); break;
      default: this.ticketsMostrados = [...this.tickets];
    }
  }

  // ✅ CORRECCIÓN: Ahora los administradores también pueden reasignar
  puedeAsignar(ticket: any): boolean {
    return this.esAdmin || this.miId == this.grupoCreadorId || this.miId == ticket.autor_id;
  }

  editarTicket(ticket: any) {
    if (!this.canEdit) return;
    this.ticketEditando = { 
      ...ticket, 
      tienePermisoAsignar: this.puedeAsignar(ticket) 
    };
    this.mostrarModal = true;
  }

  guardarEdicion() {
    if (!this.canEdit) return;
    const ticketOriginal = this.tickets.find(t => t.id === this.ticketEditando.id);
    if (!ticketOriginal) return;

    const cambioEstado = ticketOriginal.estado !== this.ticketEditando.estado;
    const cambioDatos = ticketOriginal.titulo !== this.ticketEditando.titulo ||
                        ticketOriginal.descripcion !== this.ticketEditando.descripcion ||
                        ticketOriginal.prioridad !== this.ticketEditando.prioridad ||
                        ticketOriginal.asignado_id !== this.ticketEditando.asignado_id;

    if (!cambioEstado && !cambioDatos) { this.cerrarModal(); return; }

    const peticiones: Promise<void>[] = [];
    
    if (cambioEstado) {
      peticiones.push(new Promise((res, rej) => {
        this.ticketSvc.changeStatus(this.ticketEditando.id, this.ticketEditando.estado, this.groupId!)
          .subscribe({ next: () => res(), error: e => rej(e) });
      }));
    }
    
    if (cambioDatos) {
      peticiones.push(new Promise((res, rej) => {
        this.ticketSvc.updateTicket(this.ticketEditando.id, {
          titulo: this.ticketEditando.titulo,
          descripcion: this.ticketEditando.descripcion,
          prioridad: this.ticketEditando.prioridad,
          asignado_id: this.ticketEditando.asignado_id,
          grupo_id: Number(this.groupId)
        }).subscribe({ next: () => res(), error: e => rej(e) });
      }));
    }

    Promise.all(peticiones).then(() => {
      const index = this.tickets.findIndex(t => t.id === this.ticketEditando.id);
      if (index !== -1) {
        const asignadoObj = this.opcionesAsignado.find(o => o.value === this.ticketEditando.asignado_id);
        this.ticketEditando.asignadoNombre = asignadoObj?.value ? asignadoObj.label : 'Sin asignar';
        this.tickets[index] = { ...this.ticketEditando };
      }
      this.aplicarFiltroRapido(this.filtroActivo);
      this.cerrarModal();
      this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket actualizado.' });
    }).catch(err => {
      console.error("Error en PATCH:", err);
      this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al guardar.' });
    });
  }

  getSeverity(estado: string): any {
    switch (estado) {
      case 'Completado': return 'success';
      case 'En Progreso': return 'info';
      case 'Pendiente': return 'warn';
      default: return 'secondary';
    }
  }

  eliminarTicket(ticket: any) {
    if (!this.canDelete) return;
    this.confirmSvc.confirm({
      message: `¿Eliminar "${ticket.titulo}"?`,
      accept: () => {
        this.ticketSvc.deleteTicket(ticket.id, this.groupId!).subscribe({
          next: () => {
            this.tickets = this.tickets.filter(t => t.id !== ticket.id);
            this.aplicarFiltroRapido(this.filtroActivo);
            this.messageSvc.add({ severity: 'success', summary: 'Eliminado', detail: 'Ticket borrado' });
          },
          error: (err) => {
            this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al borrar' });
          }
        });
      }
    });
  }

  cerrarModal() { this.mostrarModal = false; this.ticketEditando = {}; }
  verDetallesTicket(ticket: any) { this.ticketSeleccionadoParaDetalle = ticket; this.panelDetalleVisible = true; }
  getIniciales(n: string) { return n ? n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() : '?'; }
  getColorPorNombre(n: string) {
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < (n || '').length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
    return colores[Math.abs(hash) % colores.length];
  }
}