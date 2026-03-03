import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PrimeImportsModule } from '../../prime-imports';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PrimeImportsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {}