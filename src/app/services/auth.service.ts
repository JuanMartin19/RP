// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { PermissionsService } from './permissions.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private permsSvc: PermissionsService
  ) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res?.data?.token) {
          this.setCookie('access_token', res.data.token, 8);
          this.setCookie('user', JSON.stringify(res.data.user), 8);
          const permisos = this.extraerPermisosDelToken(res.data.token);
          this.permsSvc.setPermissions(permisos);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      nombre_completo: data.nombre,
      username: data.usuario,
      email: data.email,
      password: data.password,
      direccion: data.direccion || null,
      telefono: data.telefono || null
    });
  }

  logout() {
    this.deleteCookie('access_token');
    this.deleteCookie('user');
    this.permsSvc.clearPermissions();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.getCookie('access_token');
  }

  getUser(): any {
    const user = this.getCookie('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  extraerPermisosDelToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.permisos || { global: [], grupos: {} };
    } catch {
      return { global: [], grupos: {} };
    }
  }

  getPermisosPorGrupoDelToken(): Record<string, string[]> {
    try {
      const token = this.getToken();
      if (!token) return {};
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.permisos?.grupos || {};
    } catch {
      return {};
    }
  }

  setCookie(name: string, value: string, horas: number) {
    const expires = new Date(Date.now() + horas * 3600 * 1000).toUTCString();
    const isProduction = window.location.protocol === 'https:';
    const secure = isProduction ? ';Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=None${secure}`;
  }

  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  refreshToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/refresh`).pipe(
      tap((res: any) => {
        if (res?.data?.token) {
          // Sobrescribimos la cookie vieja con el token fresco
          this.setCookie('access_token', res.data.token, 8);
          this.setCookie('user', JSON.stringify(res.data.user), 8);
          const permisos = this.extraerPermisosDelToken(res.data.token);
          this.permsSvc.setPermissions(permisos);
        }
      })
    );
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
}