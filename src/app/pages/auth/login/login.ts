import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../../prime-imports";
import { PermissionsService } from '../../../services/permissions.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [PrimeImportsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
  });

  constructor(
    private router: Router,
    private permsSvc: PermissionsService
  ) { }

  login() {

    const v = this.loginForm.value;

    if (!v.email || !v.password) {
      alert('Debe ingresar correo y contraseña');
      return;
    }

    const permissions = [

      // Groups
      'groups:view', 'group:view', 'group:add', 'group:edit', 'group:delete',

      // Users
      'users:view', 'user:add', 'user:view:all', 'users:add',
      'user:edit', 'users:edit',
      'user:delete', 'users:delete',

      // Tickets
      'tickets:view', 'ticket:add', 'ticket:view',
      'ticket:edite',
      'ticket:edite:state',
      'ticket:delete'

    ];

    this.permsSvc.setPermissions(permissions);

    this.router.navigate(['/home']);

  }

}