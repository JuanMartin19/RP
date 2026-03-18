import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, PrimeImportsModule,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  groupId: string | null = null;

  canAddticket = false;

  tabs: any[] = [];

  constructor(private route: ActivatedRoute,
              private permsSvc: PermissionsService
  ) {

    this.groupId = this.route.snapshot.paramMap.get('id');

    this.tabs = [
      { label: 'Resumen', icon: 'pi pi-chart-bar', routerLink: 'resumen' },
      { label: 'Tablero Kanban', icon: 'pi pi-th-large', routerLink: 'kanban' },
      { label: 'Vista de Lista', icon: 'pi pi-list', routerLink: 'lista' },
      { label: 'Gestión - Grupo', icon: 'pi pi-cog', routerLink: 'gestion' }
    ];

    this.canAddticket = this.permsSvc.hasPermission('ticket:add');
  }

}