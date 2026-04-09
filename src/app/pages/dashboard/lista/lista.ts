// src/app/pages/dashboard/lista/lista.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../../prime-imports';
import { PermissionsService } from '../../../services/permissions.service';
import { TicketService } from '../../../services/ticket.service';
import { DetalleTicket } from '../../../components/detalle-ticket/detalle-ticket';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule, DetalleTicket],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista implements OnInit {
  
  // Traemos al usuario logueado desde el storage
  usuarioActual = JSON.parse(localStorage.getItem('user') || '{}');

  // Filtros rápidos de UI
  filtrosDisponibles = ['Todos', 'Mis tickets', 'Sin asignar', 'Prioridad Alta'];
  filtroActivo = 'Todos';
  
  // Variables para el panel lateral de detalles (DetalleTicket)
  panelDetalleVisible = false;
  ticketSeleccionadoParaDetalle: any = null;

  // Configuraciones para Modales y Dropdowns
  estadosDisponibles: any[] = [
    { label: 'Todos', value: null },
    { label: 'Abierto', value: 'Abierto' },
    { label: 'En Proceso', value: 'En Proceso' },
    { label: 'Cerrado', value: 'Cerrado' }
  ];

  prioridades = ['Alta', 'Media', 'Baja'];
  estadosSinNulo = ['Abierto', 'En Proceso', 'Cerrado']; 

  // Listas de datos
  tickets: any[] = [];
  ticketsMostrados: any[] = [];

  // Control de Modal de Edición
  mostrarModal = false;
  ticketEditando: any = {};

  // Variables de Seguridad (RBAC)
  canEdit = false;
  canDelete = false;

  constructor(
    private permsSvc: PermissionsService,
    private ticketSvc: TicketService
  ) {
    // Verificamos permisos al inicializar
    this.canEdit = this.permsSvc.hasPermission('ticket:edit');
    this.canDelete = this.permsSvc.hasPermission('ticket:delete');
  }

  ngOnInit() {
    this.cargarTicketsReal();
  }

  /**
   * Obtiene los tickets reales desde el API Gateway
   */
  cargarTicketsReal() {
    // ID del grupo Proyecto Seguridad según tu base de datos
    const grupoId = '34ab290d-476f-4292-b5d5-34d9807deddb';

    this.ticketSvc.getTicketsByGroup(grupoId).subscribe({
      next: (res: any) => {
        // res.data contiene el array de tickets según buildResponse del backend
        this.tickets = res.data;
        this.aplicarFiltroRapido(this.filtroActivo);
      },
      error: (err) => {
        console.error('Error al cargar tickets:', err);
      }
    });
  }

  /**
   * Filtra la lista localmente para mejorar la velocidad de respuesta en la UI
   */
  aplicarFiltroRapido(filtro: string) {
    this.filtroActivo = filtro;
    
    if (filtro === 'Todos') {
      this.ticketsMostrados = [...this.tickets];
    } else if (filtro === 'Mis tickets') {
      // Filtramos por autor_id que es el UUID de Supabase
      this.ticketsMostrados = this.tickets.filter(t => t.autor_id === this.usuarioActual.id);
    } else if (filtro === 'Sin asignar') {
      this.ticketsMostrados = this.tickets.filter(t => !t.asignado_id);
    } else if (filtro === 'Prioridad Alta') {
      this.ticketsMostrados = this.tickets.filter(t => t.prioridad === 'Alta');
    }
  }

  /**
   * Define el color del tag de PrimeNG según el estado
   */
  getSeverity(estado: string): any {
    switch (estado) {
      case 'Cerrado': return 'success';
      case 'En Proceso': return 'info';
      case 'Abierto': return 'warning';
      default: return 'danger';
    }
  }

  /**
   * Elimina un ticket físicamente en el backend
   */
  eliminarTicket(ticket: any) {
    if (!this.canDelete) return;

    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el ticket: ${ticket.titulo}?`);
    if (confirmar) {
      this.ticketSvc.deleteTicket(ticket.id).subscribe({
        next: () => {
          this.tickets = this.tickets.filter(t => t.id !== ticket.id);
          this.aplicarFiltroRapido(this.filtroActivo);
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No tienes permisos o hubo un error en el servidor.');
        }
      });
    }
  }

  /**
   * Abre el modal de edición cargando una copia del ticket
   */
  editarTicket(ticket: any) {
    if (!this.canEdit) return;
    this.ticketEditando = { ...ticket }; 
    this.mostrarModal = true;
  }

  /**
   * Envía los cambios al backend mediante PATCH
   */
  guardarEdicion() {
    if (!this.canEdit) return;

    this.ticketSvc.updateTicket(this.ticketEditando.id, this.ticketEditando).subscribe({
      next: (res: any) => {
        // Buscamos el ticket en nuestra lista local y lo actualizamos con lo que devuelve el server
        const index = this.tickets.findIndex(t => t.id === this.ticketEditando.id);
        if (index !== -1) {
          this.tickets[index] = { ...res.data.ticket };
        }
        
        this.aplicarFiltroRapido(this.filtroActivo);
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Error al guardar los cambios.');
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.ticketEditando = {}; 
  }

  /**
   * Abre el Sidebar de detalles (p-sidebar)
   */
  verDetallesTicket(ticket: any) {
    this.ticketSeleccionadoParaDetalle = ticket;
    this.panelDetalleVisible = true;
  }
}