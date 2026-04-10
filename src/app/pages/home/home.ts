import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from "../../prime-imports";
import { PermissionsService } from '../../services/permissions.service';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  userName = 'Usuario';
  grupos: any[] = [];
  loading = true;
  private permSub!: Subscription;

  constructor(
    private router: Router,
    private permsSvc: PermissionsService,
    private groupsSvc: GroupsService,
    private authSvc: AuthService
  ) {}

  ngOnInit() {
    const user = this.authSvc.getUser();
    if (user) this.userName = user.nombre_completo;

    if (!this.authSvc.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Restaurar permisos desde token si se recargó la página
    if (!this.permsSvc.isLoaded()) {
      const token = this.authSvc.getToken()!;
      const permisos = this.authSvc.extraerPermisosDelToken(token);
      this.permsSvc.setPermissions(permisos);
    }

    this.permSub = this.permsSvc.permissions$.subscribe(listado => {
      if (listado === null) return;
      this.cargarGrupos();
    });

    const token = this.authSvc.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload completo:', payload);
      console.log('Permisos por grupo:', payload.permisos);
      const aplanados = this.authSvc.extraerPermisosDelToken(token);
      console.log('Permisos aplanados:', aplanados);
    }
  }

  ngOnDestroy() {
    if (this.permSub) this.permSub.unsubscribe();
  }

  cargarGrupos() {
    this.loading = true;
    this.groupsSvc.getMyGroups().subscribe({
      next: (res: any) => {
        this.grupos = Array.isArray(res.data) ? res.data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando grupos:', err);
        this.loading = false;
      }
    });
  }

  seleccionarGrupo(grupo: any) {
    const permisosPorGrupo = this.authSvc.getPermisosPorGrupoDelToken();
    this.permsSvc.refreshPermissionsForGroup(grupo.id, permisosPorGrupo);
    this.router.navigate(['/dashboard', grupo.id, 'resumen']);
  }
}