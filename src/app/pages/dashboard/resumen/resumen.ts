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
  providers: [MessageService], // Importante para usar los Toasts
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
    // Al ser una ruta hija, buscamos el ID del grupo en la ruta padre
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
        // Tu backend devuelve la lista en res.data
        const tickets = Array.isArray(res.data) ? res.data : [];
        
        this.generarEstadisticas(tickets);
        
        // Guardamos los últimos 5 tickets para la tabla (el backend ya los manda ordenados por creado_en DESC)
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
    // Filtramos usando los estados exactos definidos en tu base de datos
    const pendientes = tickets.filter(t => t.estado === 'Pendiente').length;
    const progreso = tickets.filter(t => t.estado === 'En Progreso').length;
    const completados = tickets.filter(t => t.estado === 'Completado').length;

    this.estadisticas = [
      { label: 'Total', value: total, borderClass: 'border-orange' },
      { label: 'Pendientes', value: pendientes, borderClass: 'border-blue' },
      { label: 'En Progreso', value: progreso, borderClass: 'border-yellow' },
      { label: 'Completados', value: completados, borderClass: 'border-green' }
    ];
  }
}