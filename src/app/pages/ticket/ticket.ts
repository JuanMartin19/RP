import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [ReactiveFormsModule, PrimeImportsModule],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class Ticket {

  tickets: TicketModel[] = [];
  ticketDialog = false;
  editingId: number | null = null;

  ticketForm = new FormGroup({
    titulo: new FormControl('', Validators.required),
    estado: new FormControl('Abierto'),
    prioridad: new FormControl('Media'),
    autor: new FormControl(''),
    descripcion: new FormControl('')
  });

  canView = false;
  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(private permsSvc: PermissionsService) {

    this.canView = this.permsSvc.hasPermission('tickets:view');
    this.canAdd = this.permsSvc.hasPermission('tickets:add');
    this.canEdit = this.permsSvc.hasPermission('tickets:edit');
    this.canDelete = this.permsSvc.hasPermission('tickets:delete');

  }

  openNew() {
    this.ticketForm.reset();
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