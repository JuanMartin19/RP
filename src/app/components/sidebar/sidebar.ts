import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, PrimeImportsModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {

  canViewGroups = false;
  canViewUsers = false;
  canViewTickets = false;
  canViewSettings = false;

  constructor(private permsSvc: PermissionsService) {}

  ngOnInit() {

    this.canViewGroups = this.permsSvc.hasPermission('groups:view');

    this.canViewUsers = this.permsSvc.hasPermission('users:view');

    this.canViewTickets = this.permsSvc.hasPermission('tickets:view');

    this.canViewSettings = this.permsSvc.hasPermission('groups:edit');

  }

}