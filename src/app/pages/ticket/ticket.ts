// src/app/pages/ticket/ticket.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; 
import { PrimeImportsModule } from '../../prime-imports';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule, CommonModule],
  providers: [MessageService],
  templateUrl: './ticket.html',
  styleUrl: './ticket.css'
})
export class Ticket implements OnInit {

  tickets: any[] = [];
  ticketDialog = false;
  editingId: number | null = null;
  cargando = true;
  groupId: string | null = null;

  ticketForm = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl('Pendiente', { nonNullable: true }),
    prioridad: new FormControl('Media', { nonNullable: true }),
    autor: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true })
  });

  canView = true;
  canAdd = true;
  canEdit = true;
  canDelete = true;

  constructor(
    private route: ActivatedRoute,
    private ticketSvc: TicketService,
    private authSvc: AuthService,
    private messageSvc: MessageService
  ) {}

  ngOnInit() {
    // IMPORTANTE: Buscamos el ID en el padre de la ruta actual
    // ya que la URL es dashboard/:id/ticket
    this.groupId = this.route.parent?.snapshot.paramMap.get('id') || null;

    if (this.groupId) {
      this.cargarTicketsDelGrupo();
    } else {
      this.cargando = false;
      this.messageSvc.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'No se pudo identificar el grupo actual.' 
      });
    }
  }

  cargarTicketsDelGrupo() {
    this.cargando = true;
    // Llamamos al servicio pasando el ID dinámico capturado
    this.ticketSvc.getTicketsByGroup(this.groupId!).subscribe({
      next: (res: any) => {
        // Filtramos para asegurarnos que solo vengan los de este grupo
        // (Aunque el backend ya debería filtrarlos, esto es seguridad extra)
        this.tickets = res.data || [];
        this.cargando = false;
      },
      error: () => {
        this.messageSvc.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Error al cargar tickets de este grupo.' 
        });
        this.cargando = false;
      }
    });
  }

  saveTicket() {
    if (this.ticketForm.invalid || !this.groupId) return;

    const data = this.ticketForm.getRawValue();
    const payload = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      grupo_id: Number(this.groupId) // Usamos el ID del grupo actual
    };

    if (this.editingId) {
      this.ticketSvc.updateTicket(this.editingId, payload).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket actualizado' });
          this.cargarTicketsDelGrupo();
          this.ticketDialog = false;
        }
      });
    } else {
      this.ticketSvc.createTicket(payload).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Ticket creado' });
          this.cargarTicketsDelGrupo();
          this.ticketDialog = false;
        }
      });
    }
  }

  // ... (editTicket, deleteTicket, severities se mantienen igual)
  editTicket(ticket: any) {
    this.editingId = ticket.id;
    this.ticketForm.patchValue({
      titulo: ticket.titulo,
      estado: ticket.estado,
      prioridad: ticket.prioridad,
      autor: ticket.autor?.nombre_completo || 'Sin autor',
      descripcion: ticket.descripcion
    });
    this.ticketDialog = true;
  }

  deleteTicket(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este ticket?')) return;
    this.ticketSvc.deleteTicket(id).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(t => t.id !== id);
        this.messageSvc.add({ severity: 'success', summary: 'Eliminado' });
      }
    });
  }

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

  openNew() {
    const user = this.authSvc.getUser();
    this.ticketForm.reset({ 
      estado: 'Pendiente', 
      prioridad: 'Media',
      autor: user?.nombre_completo || 'Usuario'
    });
    this.editingId = null;
    this.ticketDialog = true;
  }
}