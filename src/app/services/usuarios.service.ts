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
}