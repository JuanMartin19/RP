// src/app/services/permissions.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface PermissionStructure {
  global: string[];
  grupos: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private permissionsSubject = new BehaviorSubject<PermissionStructure | null>(null);
  // Exponemos el observable para el Home
  permissions$ = this.permissionsSubject.asObservable();

  private activeGrupoPermissionsSubject = new BehaviorSubject<string[]>([]);
  activeGrupoPermissions$ = this.activeGrupoPermissionsSubject.asObservable();

  constructor() {}

  setPermissions(permissions: PermissionStructure) {
    this.permissionsSubject.next(permissions);
  }

  refreshPermissionsForGroup(grupoId: string | number) {
    const all = this.permissionsSubject.value;
    if (!all) {
      this.activeGrupoPermissionsSubject.next([]);
      return;
    }
    const permisosDelGrupo = all.grupos[String(grupoId)] || [];
    this.activeGrupoPermissionsSubject.next(permisosDelGrupo);
  }

  hasPermission(permission: string): boolean {
    const current = this.permissionsSubject.value;
    if (!current) return false;
    if (current.global.includes(permission)) return true;
    return this.activeGrupoPermissionsSubject.value.includes(permission);
  }

  // Nuevo: para la directiva [ifHasPermission]
  hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some(p => this.hasPermission(p));
  }

  // Nuevo: para el Home
  isLoaded(): boolean {
    return this.permissionsSubject.value !== null;
  }

  clearPermissions() {
    this.permissionsSubject.next(null);
    this.activeGrupoPermissionsSubject.next([]);
  }
}