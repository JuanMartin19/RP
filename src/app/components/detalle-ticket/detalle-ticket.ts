import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../prime-imports';

@Component({
  selector: 'app-detalle-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule],
  templateUrl: './detalle-ticket.html',
  styleUrl: './detalle-ticket.css'
})
export class DetalleTicket implements OnInit {
  
  // Controla si el panel está abierto o cerrado
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  // El ticket que recibe para mostrar
  @Input() ticket: any = null;

  // Usuario actual (simulado) para lógica de permisos
  usuarioActual = 'Jonathan Cruz';
  esCreador = false;
  esAsignado = false;

  nuevoComentario = '';

  estados = ['Pendiente', 'En Progreso', 'Revisión', 'Hecho', 'Bloqueado'];
  
  // Las 7 prioridades en Chino
  prioridadesChino = [
    { label: 'Urgente', value: 'Urgente' },
    { label: 'Muy Alta', value: 'Muy Alta' },
    { label: 'Alta', value: 'Alta' },
    { label: 'Media', value: 'Media' },
    { label: 'Baja', value: 'Baja' },
    { label: 'Muy Baja', value: 'Muy Baja' },
    { label: 'En Pausa', value: 'En Pausa' }
  ];

  // Simulación de Base de Datos para comentarios e historial
  comentarios = [
    { autor: 'Emmanuel R.', fecha: '2026-03-15 10:30', texto: 'Ya revisé los logs, parece ser un error de CORS.' },
    { autor: 'Jonathan Cruz', fecha: '2026-03-15 11:05', texto: 'Perfecto, ajustaré los headers en el backend hoy mismo.' }
  ];

  historial = [
    { accion: 'Ticket creado', autor: 'Emmanuel R.', fecha: '2026-03-14 09:00' },
    { accion: 'Estado cambiado a En Progreso', autor: 'Jonathan Cruz', fecha: '2026-03-15 10:00' }
  ];

  ngOnInit() {
    this.evaluarPermisos();
  }

  // Cuando cambia el ticket que le pasamos por Input, re-evalúa permisos
  ngOnChanges() {
    if (this.ticket) {
      this.evaluarPermisos();
    }
  }

  evaluarPermisos() {
    if (!this.ticket) return;
    
    // Asumimos que el ticket trae un campo 'creador'. Aquí lo simulamos:
    const creadorTicket = 'Emmanuel R.'; 
    
    this.esCreador = (this.usuarioActual === creadorTicket);
    this.esAsignado = (this.ticket.asignado === this.usuarioActual || this.ticket.autor === this.usuarioActual);
  }

  cerrarPanel() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim()) return;

    this.comentarios.unshift({
      autor: this.usuarioActual,
      fecha: 'Justo ahora',
      texto: this.nuevoComentario
    });
    
    // Registrar en el historial
    this.registrarEnHistorial('Agregó un comentario');
    this.nuevoComentario = '';
  }

  registrarEnHistorial(accion: string) {
    this.historial.unshift({
      accion: accion,
      autor: this.usuarioActual,
      fecha: 'Justo ahora'
    });
  }

  guardarCambios() {
    this.registrarEnHistorial('Actualizó los detalles del ticket');
    alert('Cambios guardados correctamente');
    this.cerrarPanel();
  }
}