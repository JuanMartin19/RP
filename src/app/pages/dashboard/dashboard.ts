import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, PrimeImportsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  groupId: string | null = null;
  canAddticket = false;

  constructor(
    private route: ActivatedRoute,
    private permsSvc: PermissionsService
  ) {
    // Capturamos el ID del grupo de la URL: /dashboard/1
    this.groupId = this.route.snapshot.paramMap.get('id');
    
    // Verificamos si el usuario tiene permiso para crear tickets
    this.canAddticket = this.permsSvc.hasPermission('ticket:add');
  }
}