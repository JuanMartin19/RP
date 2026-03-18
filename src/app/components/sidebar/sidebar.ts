import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PrimeImportsModule } from '../../prime-imports';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

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
export class Sidebar {}