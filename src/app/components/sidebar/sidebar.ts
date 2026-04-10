import { Component } from '@angular/core';
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
export class Sidebar {

  constructor(
    private authSvc: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authSvc.logout();
  }
}