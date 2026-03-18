import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../../prime-imports';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, PrimeImportsModule],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
})
export class Kanban implements OnInit {
  
  // Nombre del usuario actual para simular "Mis tickets"
  usuarioActual = 'Juan M.';

  columnas = [
    { titulo: 'Pendiente', valor: 'Pendiente' },
    { titulo: 'En Progreso', valor: 'En Progreso' },
    { titulo: 'Revisión', valor: 'Revisión' },
    { titulo: 'Hecho', valor: 'Hecho' }
  ];

  // Definimos los filtros posibles
  filtrosDisponibles = ['Todos', 'Mis tickets', 'Sin asignar', 'Prioridad Alta'];
  filtroActivo = 'Todos'; // Filtro por defecto

  tickets: any[] = [];
  draggedTicket: any | null = null;

  ngOnInit() {
    this.tickets = [
      { id: 'TK-1', titulo: 'Diseñar base de datos', estado: 'Pendiente', asignado: { nombre: 'Marco Antonio', iniciales: 'MA', color: '#3b82f6' }, prioridad: 'Alta', fecha: '15 Oct' },
      { id: 'TK-2', titulo: 'Crear API REST', estado: 'En Progreso', asignado: { nombre: 'Paula Valeria', iniciales: 'PV', color: '#10b981' }, prioridad: 'Media', fecha: '18 Oct' },
      { id: 'TK-3', titulo: 'Probar vistas UX', estado: 'Pendiente', asignado: null, prioridad: 'Baja', fecha: '20 Oct' },
      { id: 'TK-4', titulo: 'Configurar entorno', estado: 'Revisión', asignado: { nombre: 'Juan M.', iniciales: 'JM', color: '#f59e0b' }, prioridad: 'Alta', fecha: '12 Oct' }
    ];
  }

  // --- LÓGICA DE FILTROS ---
  cambiarFiltro(nuevoFiltro: string) {
    this.filtroActivo = nuevoFiltro;
  }

  // Ahora esta función filtra por columna Y por el botón seleccionado
  getTicketsPorEstado(estado: string) {
    let ticketsFiltrados = this.tickets.filter(t => t.estado === estado);

    if (this.filtroActivo === 'Todos') {
      return ticketsFiltrados;
    } 
    
    if (this.filtroActivo === 'Mis tickets') {
      return ticketsFiltrados.filter(t => t.asignado && t.asignado.nombre === this.usuarioActual);
    } 
    
    if (this.filtroActivo === 'Sin asignar') {
      return ticketsFiltrados.filter(t => t.asignado === null);
    } 
    
    if (this.filtroActivo === 'Prioridad Alta') {
      return ticketsFiltrados.filter(t => t.prioridad === 'Alta');
    }

    return ticketsFiltrados;
  }

  // --- Lógica de Drag & Drop ---
  dragStart(ticket: any) {
    this.draggedTicket = ticket;
  }

  drop(estadoDestino: string) {
    if (this.draggedTicket) {
      const index = this.tickets.findIndex(t => t.id === this.draggedTicket.id);
      if (index !== -1) {
        this.tickets[index].estado = estadoDestino;
      }
      this.draggedTicket = null;
    }
  }

  dragEnd() {
    this.draggedTicket = null;
  }

  abrirDetalle(ticket: any) {
    alert(`Abriendo detalles de: ${ticket.titulo}\nEstado: ${ticket.estado}`);
  }
}