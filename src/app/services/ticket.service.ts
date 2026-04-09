// src/app/services/ticket.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketService {
  // Usamos template strings para evitar errores de concatenación accidental
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  // Tipamos con Observable<any> para que Angular sepa que es una petición asíncrona
  getTicketsByGroup(grupoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/group/${grupoId}`);
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, ticket);
  }

  updateTicket(id: string, data: any) {
    return this.http.patch(`${this.apiUrl}/edit/${id}`, data);
  }

  deleteTicket(id: string) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}