import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PermissionsService {

  // Permisos globales — NUNCA se sobreescriben después del login
  private allPermissionsSubject = new BehaviorSubject<string[] | null>(null);
  permissions$: Observable<string[] | null> = this.allPermissionsSubject.asObservable();

  // Permisos del grupo activo — solo para uso dentro del dashboard
  private grupoPermissionsSubject = new BehaviorSubject<string[]>([]);
  grupoPermissions$: Observable<string[]> = this.grupoPermissionsSubject.asObservable();

  setPermissions(permissions: string[]) {
    this.allPermissionsSubject.next(permissions);
  }

  // Solo actualiza los permisos del grupo — NO toca los globales
  refreshPermissionsForGroup(grupoId: string | number, permisosPorGrupo: Record<string, string[]>) {
    const permisos = permisosPorGrupo[String(grupoId)] || [];
    this.grupoPermissionsSubject.next(permisos);
  }

  // Usa permisos GLOBALES — para sidebar y rutas
  hasPermission(permission: string): boolean {
    const current = this.allPermissionsSubject.value;
    return current ? current.includes(permission) : false;
  }

  hasAnyPermission(requiredPermissions: string[]): boolean {
    const current = this.allPermissionsSubject.value;
    if (!current) return false;
    return requiredPermissions.some(p => current.includes(p));
  }

  // Usa permisos del GRUPO ACTIVO — para botones dentro del dashboard
  hasGrupoPermission(permission: string): boolean {
    return this.grupoPermissionsSubject.value.includes(permission);
  }

  isLoaded(): boolean {
    return this.allPermissionsSubject.value !== null;
  }

  clearPermissions() {
    this.allPermissionsSubject.next(null);
    this.grupoPermissionsSubject.next([]);
  }
}