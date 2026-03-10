import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private permissions: string[] = [];

  setPermissions(perms: string[]) {
    this.permissions = perms;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

}