// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  
  // URL local de tu API Gateway
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
    );
  }

  register(data: any): Observable<any> {
    const body = {
      nombre_completo: data.nombre,
      username: data.usuario,
      email: data.email,
      password: data.password,
      direccion: data.direccion,
      telefono: data.telefono
    };
    return this.http.post(`${this.apiUrl}/register`, body);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}