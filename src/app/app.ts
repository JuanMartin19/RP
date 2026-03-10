import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(private permsSvc: PermissionsService) {
    const jwtPerms = [

      'group:view','groups:view',
      'group:add','groups:add',
      'group:edit','groups:edit',
      'group:delete','groups:delete',

      'user:view','users:view',
      'user:add','users:add',
      'user:edit','users:edit',
      'user:delete','users:delete',

      'ticket:view','tickets:view',
      'ticket:add','tickets:add',
      'ticket:edit','tickets:edit',
      'ticket:delete','tickets:delete'

    ];
    this.permsSvc.setPermissions(jwtPerms);
  }

  protected readonly title = signal('RP');

}