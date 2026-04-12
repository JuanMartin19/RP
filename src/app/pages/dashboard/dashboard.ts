// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; // Añadimos Router
import { PrimeImportsModule } from '../../prime-imports';
import { GroupsService } from '../../services/groups.service';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PrimeImportsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  groupId: string | null = null;
  grupoData: any = null;
  cargando = true;
  canAddTicket = false;

  items = [
    { label: 'Resumen', icon: 'pi pi-home', routerLink: 'resumen' },
    { label: 'Tablero Kanban', icon: 'pi pi-th-large', routerLink: 'kanban' },
    { label: 'Lista de Tickets', icon: 'pi pi-list', routerLink: 'lista' },
    { label: 'Gestión de Equipo', icon: 'pi pi-users', routerLink: 'gestion' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router, // Inyectamos el Router
    private groupsSvc: GroupsService,
    private permsSvc: PermissionsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id');
      if (this.groupId) {
        this.permsSvc.refreshPermissionsForGroup(this.groupId);
        this.canAddTicket = this.permsSvc.hasPermission('ticket:add');
        this.cargarInfoGrupo();
      }
    });
  }

  cargarInfoGrupo() {
    this.cargando = true;
    this.groupsSvc.getGroupById(this.groupId!).subscribe({
      next: (res: any) => {
        this.grupoData = res.data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  // Ahora esta función te manda al link directo
  quickTicket() {
    if (this.groupId) {
      // Navega a dashboard/:id/ticket
      this.router.navigate(['/dashboard', this.groupId, 'ticket']);
    }
  }
}