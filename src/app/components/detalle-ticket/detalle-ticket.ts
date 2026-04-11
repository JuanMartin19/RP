import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../prime-imports';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-detalle-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule],
  providers: [MessageService],
  templateUrl: './detalle-ticket.html',
  styleUrl: './detalle-ticket.css'
})
export class DetalleTicket implements OnInit, OnChanges {

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() ticket: any = null;

  usuarioActual: any = null;
  nuevoComentario = '';
  cargandoDetalle = false;

  ticketCompleto: any = null;

  constructor(
    private ticketSvc: TicketService,
    private authSvc: AuthService,
    private messageSvc: MessageService
  ) {}

  ngOnInit() {
    this.usuarioActual = this.authSvc.getUser();
  }

  ngOnChanges() {
    if (this.ticket && this.visible) {
      this.cargarDetalleCompleto();
    }
  }

  cargarDetalleCompleto() {
    if (!this.ticket?.id) return;
    this.cargandoDetalle = true;

    // Solo traemos la información, comentarios e historial. Cero grupos.
    this.ticketSvc.getTicketById(this.ticket.id).subscribe({
      next: (res: any) => {
        this.ticketCompleto = { ...res.data };
        this.cargandoDetalle = false;
      },
      error: () => {
        this.ticketCompleto = { ...this.ticket, comentarios: [], historial: [] };
        this.cargandoDetalle = false;
      }
    });
  }

  cerrarPanel() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.ticketCompleto = null;
    this.nuevoComentario = ''; // Limpiar cajón
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim() || !this.ticketCompleto) return;

    this.ticketSvc.addComment(this.ticketCompleto.id, this.nuevoComentario.trim()).subscribe({
      next: (res: any) => {
        const nuevoC = res.data?.comentario;
        if (nuevoC) {
          this.ticketCompleto.comentarios = [
            ...(this.ticketCompleto.comentarios || []),
            nuevoC
          ];
        }
        this.nuevoComentario = '';
        this.messageSvc.add({ severity: 'success', summary: 'Comentario agregado', detail: '' });
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el comentario.' });
      }
    });
  }

  eliminarComentario(comentario: any) {
    const miId = this.usuarioActual?.id || this.usuarioActual?.sub;
    if (comentario.autor?.id != miId) return;

    this.ticketSvc.deleteComment(this.ticketCompleto.id, comentario.id).subscribe({
      next: () => {
        this.ticketCompleto.comentarios = this.ticketCompleto.comentarios
          .filter((c: any) => c.id !== comentario.id);
        this.messageSvc.add({ severity: 'warn', summary: 'Comentario eliminado', detail: '' });
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el comentario.' });
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (estado) {
      case 'Completado': return 'success';
      case 'En Progreso': return 'info';
      case 'Pendiente': return 'warn';
      default: return 'secondary';
    }
  }
}