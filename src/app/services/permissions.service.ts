import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  // lista de permisos del usuario
  private userPermissions = signal<string[]>([]);

  // cargar permisos (por ejemplo después del login)
  setPermissions(perms: string[]) {
    this.userPermissions.set(perms);
  }

  // verificar permiso simple
  hasPermission(permiso: string): boolean {
    return this.userPermissions().includes(permiso);
  }

  // verificar si tiene alguno de varios permisos
  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this.hasPermission(p));
  }
}