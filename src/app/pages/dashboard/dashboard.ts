// src/app/pages/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; 
import { PrimeImportsModule } from '../../prime-imports';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';

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
  canViewTickets = false;

  items = [
    { label: 'Resumen', icon: 'pi pi-home', routerLink: 'resumen' },
    { label: 'Tablero Kanban', icon: 'pi pi-th-large', routerLink: 'kanban' },
    { label: 'Lista de Tickets', icon: 'pi pi-list', routerLink: 'lista' },
    { label: 'Gestión de Equipo', icon: 'pi pi-users', routerLink: 'gestion' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router, 
    private groupsSvc: GroupsService,
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id');
      if (this.groupId) {
        this.verificarPermisosEstrictos(); 
        this.authSvc.refreshToken().subscribe({
          next: () => {
            this.verificarPermisosEstrictos(); 
          }
        });
        this.cargarInfoGrupo();
      }
    });
  }

  // LECTURA 100% ESTRICTA: Sin comodines.
  verificarPermisosEstrictos() {
    const token = this.authSvc.getToken();
    if (!token) return;
    
    const payload = this.authSvc.extraerPermisosDelToken(token);
    const globales = payload.global || [];
    const delGrupo = (payload.grupos && payload.grupos[this.groupId!]) ? payload.grupos[this.groupId!] : [];

    // Solo ves el botón si tienes EXPRESAMENTE el ticket:view
    this.canViewTickets = globales.includes('ticket:view') || delGrupo.includes('ticket:view');
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

  quickTicket() {
    if (this.groupId) {
      this.router.navigate(['/dashboard', this.groupId, 'ticket']);
    }
  }
}