import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../../prime-imports';
import { PermissionsService } from '../../../services/permissions.service';
import { DetalleTicket } from '../../../components/detalle-ticket/detalle-ticket';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule, DetalleTicket],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista implements OnInit {
  
  usuarioActual = 'Jonathan';

  // Filtros rápidos
  filtrosDisponibles = ['Todos', 'Mis tickets', 'Sin asignar', 'Prioridad Alta'];
  filtroActivo = 'Todos';
  
  //NUEVAS VARIABLES PARA CONTROLAR EL PANEL LATERAL
  panelDetalleVisible = false;
  ticketSeleccionadoParaDetalle: any = null;

  estadosDisponibles: any[] = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En Progreso', value: 'En Progreso' },
    { label: 'Hecho', value: 'Hecho' }
  ];

  prioridades = ['Alta', 'Media', 'Baja'];
  estadosSinNulo = ['Pendiente', 'En Progreso', 'Hecho']; 

  tickets: any[] = [];
  ticketsMostrados: any[] = [];

  mostrarModal = false;
  ticketEditando: any = {};

  // Variables de Permisos
  canEdit = false;
  canDelete = false;

  constructor(private permsSvc: PermissionsService) {
    this.canEdit = this.permsSvc.hasPermission('ticket:edite');
    this.canDelete = this.permsSvc.hasPermission('ticket:delete');
  }

  ngOnInit() {
    this.tickets = [
      { id: 'TK-1', titulo: 'Tarea 1', estado: 'Pendiente', asignado: 'Jonathan', prioridad: 'Alta', fechaLimite: '2026-03-15' },
      { id: 'TK-2', titulo: 'Tarea 2', estado: 'Hecho', asignado: 'Admin', prioridad: 'Baja', fechaLimite: '2026-03-10' },
      { id: 'TK-3', titulo: 'Corregir Bug UI', estado: 'En Progreso', asignado: 'Jonathan', prioridad: 'Media', fechaLimite: '2026-03-12' },
      { id: 'TK-4', titulo: 'Actualizar dependencias', estado: 'Pendiente', asignado: null, prioridad: 'Baja', fechaLimite: '2026-03-20' }
    ];
    this.aplicarFiltroRapido('Todos');
  }

  aplicarFiltroRapido(filtro: string) {
    this.filtroActivo = filtro;
    if (filtro === 'Todos') {
      this.ticketsMostrados = [...this.tickets];
    } else if (filtro === 'Mis tickets') {
      this.ticketsMostrados = this.tickets.filter(t => t.asignado === this.usuarioActual);
    } else if (filtro === 'Sin asignar') {
      this.ticketsMostrados = this.tickets.filter(t => !t.asignado);
    } else if (filtro === 'Prioridad Alta') {
      this.ticketsMostrados = this.tickets.filter(t => t.prioridad === 'Alta');
    }
  }

  getSeverity(estado: string): any {
    switch (estado) {
      case 'Hecho': return 'success';
      case 'En Progreso': return 'info';
      case 'Pendiente': return 'warning';
      default: return 'danger';
    }
  }

  eliminarTicket(ticket: any) {
    // Si no tiene permisos, cortamos la ejecución (doble seguridad)
    if(!this.canDelete) return;

    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el ticket ${ticket.id}?`);
    if (confirmar) {
      this.tickets = this.tickets.filter(t => t.id !== ticket.id);
      this.aplicarFiltroRapido(this.filtroActivo);
    }
  }

  editarTicket(ticket: any) {
    // Si no tiene permisos, no abrimos el modal
    if(!this.canEdit) return;

    this.ticketEditando = { ...ticket }; 
    this.mostrarModal = true;
  }

  guardarEdicion() {
    if(!this.canEdit) return;

    const index = this.tickets.findIndex(t => t.id === this.ticketEditando.id);
    if (index !== -1) {
      this.tickets[index] = { ...this.ticketEditando };
    }
    
    this.aplicarFiltroRapido(this.filtroActivo);
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.ticketEditando = {}; 
  }

  verDetallesTicket(ticket: any) {
    this.ticketSeleccionadoParaDetalle = ticket;
    this.panelDetalleVisible = true;
  }
}