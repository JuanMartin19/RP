import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PrimeImportsModule } from '../../../prime-imports';
import { TicketService } from '../../../services/ticket.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, PrimeImportsModule],
  providers: [MessageService],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css'
})
export class Resumen implements OnInit {
  
  groupId: string | null = null;
  cargando = true;

  estadisticas: any[] = [];
  ticketsRecientes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private ticketSvc: TicketService,
    private messageSvc: MessageService
  ) {}

  ngOnInit() {
    this.groupId = this.route.parent?.snapshot.paramMap.get('id') || null;

    if (this.groupId) {
      this.cargarTickets();
    } else {
      this.cargando = false;
      this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'ID de grupo no válido' });
    }
  }

  cargarTickets() {
    this.cargando = true;
    this.ticketSvc.getTicketsByGroup(this.groupId!).subscribe({
      next: (res: any) => {
        const tickets = Array.isArray(res.data) ? res.data : [];
        
        this.generarEstadisticas(tickets);
        this.ticketsRecientes = tickets.slice(0, 5);
        this.cargando = false;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets del grupo.' });
        this.cargando = false;
      }
    });
  }

  generarEstadisticas(tickets: any[]) {
    const total = tickets.length;
    const pendientes = tickets.filter(t => t.estado === 'Pendiente').length;
    const progreso = tickets.filter(t => t.estado === 'En Progreso').length;
    const completados = tickets.filter(t => t.estado === 'Completado').length;

    // Actualizado para usar clases de colores de PrimeFlex compatibles con tema oscuro
    this.estadisticas = [
      { label: 'Total Tickets', value: total, icon: 'pi pi-ticket', color: 'text-purple-400', bg: 'bg-purple-500/10' },
      { label: 'Pendientes', value: pendientes, icon: 'pi pi-clock', color: 'text-orange-400', bg: 'bg-orange-500/10' },
      { label: 'En Progreso', value: progreso, icon: 'pi pi-spin pi-spinner', color: 'text-blue-400', bg: 'bg-blue-500/10' },
      { label: 'Completados', value: completados, icon: 'pi pi-check-circle', color: 'text-green-400', bg: 'bg-green-500/10' }
    ];
  }

  // Funciones importadas de tu pantalla de tickets para mantener coherencia visual
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
}