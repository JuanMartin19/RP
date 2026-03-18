import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { PermissionsService } from './services/permissions.service';
import { HasPermissionDirective } from './directives/has-permission.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, HasPermissionDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(private permsSvc: PermissionsService) {
    // Simular de permisos que vienen del JWT cuando hacemos login
    const jwtPerms = [
      // Groups
      'groups:view', 'group:view', 'group:add', 'group:edit', 'group:delete',
      // Users
      'users:view', 'user:add', 'user:view:all', 'users:add', 'user:edit', 'users:edit', 'user:delete', 'users:delete',
      // Tickets
      'tickets:view', 'ticket:add', 'ticket:view', 'ticket:edite', 'ticket:edite:state', 'ticket:delete'
    ];
    this.permsSvc.setPermissions(jwtPerms);

  }

  protected readonly title = signal('RP');

}