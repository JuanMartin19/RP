import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';

interface TicketModel {
  id?: number;
  titulo: string;
  estado: string;
  prioridad: string;
  autor: string; 
  descripcion: string;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule, CommonModule],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class Ticket implements OnInit {

  tickets: TicketModel[] = [];
  ticketDialog = false;
  editingId: number | null = null;

  ticketForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    estado: new FormControl('Pendiente'),
    prioridad: new FormControl('Media'),
    autor: new FormControl(''),
    descripcion: new FormControl('')
  });

  canView = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(private permsSvc: PermissionsService) {
    // Usando los permisos exactos que proveíste:
    // 'tickets:view', 'ticket:add', 'ticket:view', 'ticket:edite', 'ticket:edite:state', 'ticket:delete'
    
    // Asumimos que tickets:view y ticket:view sirven para lo mismo aquí
    this.canView = this.permsSvc.hasPermission('tickets:view') || this.permsSvc.hasPermission('ticket:view');
    
    this.canAdd = this.permsSvc.hasPermission('ticket:add');
    
    // Notar que el permiso es 'ticket:edite' (con e al final), no 'ticket:edit'
    this.canEdit = this.permsSvc.hasPermission('ticket:edite'); 
    
    this.canDelete = this.permsSvc.hasPermission('ticket:delete');
  }

  ngOnInit() {
    this.tickets = [
      { id: 1, titulo: 'Error en Login', estado: 'Pendiente', prioridad: 'Alta', autor: 'Jonathan', descripcion: 'Falla al entrar' }
    ];
  }

  getEstadoSeverity(estado: string): any {
    if (estado === 'Pendiente') return 'warning';
    if (estado === 'En progreso') return 'info';
    return 'success';
  }

  getPrioridadSeverity(prioridad: string): any {
    if (prioridad === 'Alta') return 'danger';
    if (prioridad === 'Media') return 'warning';
    return 'info';
  }

  openNew() {
    this.ticketForm.reset({ estado: 'Pendiente', prioridad: 'Media' });
    this.editingId = null;
    this.ticketDialog = true;
  }

  editTicket(ticket: TicketModel) {
    this.ticketForm.patchValue(ticket);
    this.editingId = ticket.id!;
    this.ticketDialog = true;
  }

  deleteTicket(id: number) {
    this.tickets = this.tickets.filter(t => t.id !== id);
  }

  saveTicket() {
    if (this.ticketForm.valid) {
      const data = this.ticketForm.value as TicketModel;
      if (this.editingId) {
        this.tickets = this.tickets.map(t =>
          t.id === this.editingId ? { ...data, id: this.editingId } : t
        );
      } else {
        this.tickets = [...this.tickets, { ...data, id: Date.now() }];
      }
      this.ticketDialog = false;
    }
  }
}