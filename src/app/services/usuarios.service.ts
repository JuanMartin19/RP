import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getById(id: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  update(id: number | string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getGlobalPermissions(userId: number | string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/permissions`);
  }

  /** Asigna un nuevo permiso global a un usuario */
  assignGlobalPermission(userId: number | string, permisoNombre: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/permissions`, { 
      permiso_nombre: permisoNombre 
    });
  }

  /** Revoca/Elimina un permiso global de un usuario */
  revokeGlobalPermission(userId: number | string, permisoNombre: string): Observable<any> {
    // Nota: Usamos el método delete con body, igual que en grupos
    return this.http.delete(`${this.apiUrl}/${userId}/permissions`, { 
        body: { permiso_nombre: permisoNombre } 
    });
  }
}