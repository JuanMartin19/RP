import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GroupsService {

  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  getMyGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getAllGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  getGroupById(id: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createGroup(data: { nombre: string; descripcion?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  updateGroup(id: number | string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteGroup(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addMember(grupoId: number | string, usuario_id: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${grupoId}/members`, { usuario_id });
  }

  removeMember(grupoId: number | string, usuario_id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${grupoId}/members/${usuario_id}`);
  }

  assignPermission(grupoId: number | string, usuario_id: number | string, permiso_nombre: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${grupoId}/permissions`, { usuario_id, permiso_nombre });
  }

  revokePermission(grupoId: number | string, usuario_id: number | string, permiso_nombre: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${grupoId}/permissions`, {
      body: { usuario_id, permiso_nombre }
    });
  }

  getUserPermissions(grupoId: number | string, usuario_id: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${grupoId}/permissions/${usuario_id}`);
  }

  getUserGroups(usuarioId: string | number) {
    return this.http.get(`${environment.apiUrl}/users/${usuarioId}/groups`);
  }
}