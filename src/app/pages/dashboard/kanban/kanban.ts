import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeImportsModule } from '../../../prime-imports';
import { TicketService } from '../../../services/ticket.service';
import { AuthService } from '../../../services/auth.service';
import { PermissionsService } from '../../../services/permissions.service';
import { DetalleTicket } from '../../../components/detalle-ticket/detalle-ticket';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, PrimeImportsModule, DetalleTicket],
  providers: [MessageService],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
})
export class Kanban implements OnInit {

  groupId: string | null = null;
  cargando = true;

  usuarioActualId: number | null = null;
  canMove = false;

  columnas = [
    { titulo: 'Pendiente',   valor: 'Pendiente'   },
    { titulo: 'En Progreso', valor: 'En Progreso'  },
    { titulo: 'Completado',  valor: 'Completado'   }
  ];

  filtrosDisponibles = [
    'Todos', 'Mis tickets', 'Asignados a mi',
    'Sin asignar', 'Prioridad Alta', 'Prioridad Media', 'Prioridad Baja'
  ];
  filtroActivo = 'Todos';

  tickets: any[] = [];
  draggedTicket: any = null;

  // Para ver detalle del ticket
  detalleVisible = false;
  ticketDetalle: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketSvc: TicketService,
    private authSvc: AuthService,
    private permsSvc: PermissionsService,
    private messageSvc: MessageService
  ) {}

  ngOnInit() {
    // ✅ Leer usuario desde cookie
    const user = this.authSvc.getUser();
    this.usuarioActualId = user?.id ?? null;
    this.canMove = this.permsSvc.hasPermission('ticket:edit:state');

    this.groupId = this.route.parent?.snapshot.paramMap.get('id') || null;
    if (this.groupId) {
      this.cargarTickets();
    } else {
      this.cargando = false;
    }
  }

  cargarTickets() {
    this.cargando = true;
    this.ticketSvc.getTicketsByGroup(this.groupId!).subscribe({
      next: (res: any) => {
        const rawTickets: any[] = Array.isArray(res.data) ? res.data : [];
        this.tickets = rawTickets.map((t: any) => ({
          ...t,
          autor_id: t.autor?.id ?? null,
          asignado_id: t.asignado?.id ?? null,
          fecha: new Date(t.creado_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
          asignadoInfo: t.asignado ? {
            id: t.asignado.id,
            nombre: t.asignado.nombre_completo,
            iniciales: this.obtenerIniciales(t.asignado.nombre_completo),
            color: this.obtenerColorPorNombre(t.asignado.nombre_completo)
          } : null
        }));
        this.cargando = false;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets.' });
        this.cargando = false;
      }
    });
  }

  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
  }

  getTicketsPorEstado(estado: string): any[] {
    let lista = this.tickets.filter(t => t.estado === estado);

    switch (this.filtroActivo) {
      case 'Mis tickets':
        return lista.filter(t => t.autor_id == this.usuarioActualId);
      case 'Asignados a mi':
        return lista.filter(t => t.asignado_id == this.usuarioActualId);
      case 'Sin asignar':
        return lista.filter(t => !t.asignado_id);
      case 'Prioridad Alta':
        return lista.filter(t => t.prioridad === 'Alta');
      case 'Prioridad Media':
        return lista.filter(t => t.prioridad === 'Media');
      case 'Prioridad Baja':
        return lista.filter(t => t.prioridad === 'Baja');
      default:
        return lista;
    }
  }

  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  drop(estadoDestino: string) {
      if (!this.draggedTicket || this.draggedTicket.estado === estadoDestino) {
        this.draggedTicket = null;
        return;
      }

      const index = this.tickets.findIndex(t => t.id === this.draggedTicket.id);
      const estadoAnterior = this.tickets[index].estado;

      // Optimistic UI
      this.tickets[index].estado = estadoDestino;

      // CORRECCIÓN: Ahora enviamos this.groupId
      this.ticketSvc.changeStatus(this.draggedTicket.id, estadoDestino, this.groupId!).subscribe({
        next: () => {
          this.messageSvc.add({
            severity: 'success',
            summary: 'Movido',
            detail: `Ticket pasado a "${estadoDestino}".`
          });
        },
        error: (err) => {
          // Revertir si falla
          this.tickets[index].estado = estadoAnterior;
          const msg = err.error?.data?.message || 'No puedes mover este ticket.';
          this.messageSvc.add({ severity: 'error', summary: 'Sin permiso', detail: msg });
        }
      });

      this.draggedTicket = null;
  }

  dragEnd() {
    this.draggedTicket = null;
  }

  // ✅ Reemplazado alert() por navegación al detalle
  abrirDetalle(ticket: any) {
    this.ticketDetalle = ticket;
    this.detalleVisible = true;
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  obtenerColorPorNombre(nombre: string): string {
    const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colores[Math.abs(hash) % colores.length];
  }
}