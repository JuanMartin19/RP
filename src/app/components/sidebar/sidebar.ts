import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PrimeImportsModule } from '../../prime-imports';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    PrimeImportsModule,
    CommonModule,
    HasPermissionDirective
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) {}

  // Esta es la magia: se ejecuta solito en cuanto el menú aparece en pantalla
  ngOnInit() {
    this.authSvc.refreshToken().subscribe({
      error: () => {
        // Si el token fallara o expirara por completo, cerramos sesión por seguridad
        this.logout();
      }
    });
  }

  logout() {
    this.authSvc.logout();
  }
}