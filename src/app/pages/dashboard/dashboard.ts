import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router'; 
import { PrimeImportsModule } from '../../prime-imports';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service'; // <-- IMPORTAMOS EL AUTHSVC

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
  canViewTickets = false; // <-- CAMBIADO A VIEW

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
    private authSvc: AuthService // <-- INYECTADO
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.groupId = params.get('id');
      if (this.groupId) {
        this.verificarPermisos(); // Usamos la nueva función
        this.cargarInfoGrupo();
      }
    });
  }

  // NUEVA FUNCIÓN: Lee directo del token para evitar errores
  verificarPermisos() {
    const token = this.authSvc.getToken();
    if (!token) return;
    
    const payload = this.authSvc.extraerPermisosDelToken(token);
    const globales = payload.global || [];
    const delGrupo = (payload.grupos && payload.grupos[this.groupId!]) ? payload.grupos[this.groupId!] : [];

    // Verificamos si tiene el permiso específico o el comodín (manage)
    this.canViewTickets = globales.includes('ticket:manage') || 
                          delGrupo.includes('ticket:manage') || 
                          globales.includes('ticket:view') || 
                          delGrupo.includes('ticket:view');
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