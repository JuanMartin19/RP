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
  ) {}

  login() {

    const v = this.loginForm.value;

    if (v.email === 'admin@gmail.com' && v.password === 'admin') {

      const ADMIN_PERMS = [

        'groups:view','groups:add','groups:edit','groups:delete',
        'users:view','users:add','users:edit','users:delete',
        'tickets:view','tickets:add','tickets:edit','tickets:delete'

      ];

      this.permsSvc.setPermissions(ADMIN_PERMS);

      alert('Bienvenido ADMIN');

      this.router.navigate(['/home']);

    }

    else if (v.email === 'user@gmail.com' && v.password === 'user') {

      const USER_PERMS = [

        'groups:view',
        'users:view',
        'tickets:view'
        
      ];

      this.permsSvc.setPermissions(USER_PERMS);

      alert('Bienvenido USER');

      this.router.navigate(['/home']);

    }

    else {

      alert('Correo o contraseña incorrectos');

    }

  }

}