import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {

  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getTicketsByGroup(grupoId: string | number, filtros?: {
    estado?: string;
    prioridad?: string;
    asignado_id?: number;
  }): Observable<any> {
    let params: any = {};
    if (filtros?.estado) params['estado'] = filtros.estado;
    if (filtros?.prioridad) params['prioridad'] = filtros.prioridad;
    if (filtros?.asignado_id) params['asignado_id'] = filtros.asignado_id;
    return this.http.get(`${this.apiUrl}/group/${grupoId}`, { params });
  }

  getTicketById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTicket(ticket: {
    grupo_id: number;
    titulo: string;
    descripcion?: string;
    prioridad?: string;
    asignado_id?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, ticket);
  }

  updateTicket(id: string | number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  changeStatus(id: number | string, estado: string, grupo_id: number | string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { 
        estado: estado,
        grupo_id: Number(grupo_id) // Enviamos el grupo_id para que el Gateway no de 403
    });
  }

  deleteTicket(id: string | number, grupo_id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?grupo_id=${grupo_id}`);
  }

  addComment(ticketId: string | number, texto: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${ticketId}/comments`, { texto });
  }

  deleteComment(ticketId: string | number, comentarioId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${ticketId}/comments/${comentarioId}`);
  }
}