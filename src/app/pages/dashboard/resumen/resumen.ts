import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../../prime-imports';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, PrimeImportsModule],
  templateUrl: './resumen.html',
  styleUrl: './resumen.css'
})
export class Resumen implements OnInit {
  
  estadisticas = [
    { label: 'Total', value: 25, borderClass: 'border-orange' },
    { label: 'Pendientes', value: 10, borderClass: 'border-blue' },
    { label: 'En Progreso', value: 5, borderClass: 'border-yellow' },
    { label: 'Hecho', value: 8, borderClass: 'border-green' },
    { label: 'Bloqueados', value: 2, borderClass: 'border-red' }
  ];

  ticketsRecientes: any[] = [];

  ngOnInit() {
    this.ticketsRecientes = [
      { id: 'TK-001', titulo: 'Error en Login', estado: 'Pendiente', prioridad: 'Alta' },
      { id: 'TK-002', titulo: 'Ajustar estilos Sidebar', estado: 'En Progreso', prioridad: 'Media' },
      { id: 'TK-003', titulo: 'Revisar DB', estado: 'Hecho', prioridad: 'Baja' }
    ];
  }
}