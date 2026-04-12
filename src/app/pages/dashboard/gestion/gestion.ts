// src/app/pages/dashboard/gestion/gestion.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PrimeImportsModule } from '../../../prime-imports';
import { PermissionsService } from '../../../services/permissions.service';
import { GroupsService } from '../../../services/groups.service';
import { UsuariosService } from '../../../services/usuarios.service'; 
import { AuthService } from '../../../services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class Gestion implements OnInit {

  groupId: string | null = null;
  nombreGrupo = 'Cargando...';
  descripcionGrupo = '';
  miembros: any[] = [];
  cargando = true;

  usuariosSistema: any[] = [];
  cargandoUsuarios = false;

  canEditGroup = false;
  canAddMember = false;
  canDeleteMember = false;
  esDuenio = false;

  mostrarModalGrupo = false;
  mostrarModalMiembro = false; 
  
  grupoEditando = { nombre: '', descripcion: '' };

  // Gestión de Permisos internos
  permisosDialog = false;
  usuarioParaPermisos: any = null;
  permisosDisponibles: string[] = [];
  permisosAsignados: string[] = [];
  
  catalogoPermisosGrupo = [
    'ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete',
    'ticket:edit:state', 'ticket:edit:comment', 'ticket:manage',
    'group:edit', 'group:manage'
  ];

  constructor(
    private route: ActivatedRoute,
    private permsSvc: PermissionsService,
    private groupsSvc: GroupsService,
    private usuariosSvc: UsuariosService,
    private authSvc: AuthService,
    private messageSvc: MessageService,
    private confirmSvc: ConfirmationService
  ) {}

  ngOnInit() {
    this.groupId = this.route.parent?.snapshot.paramMap.get('id') || null;
    if (this.groupId) {
      this.cargarDatosGrupo();
    }
  }

  cargarDatosGrupo() {
    this.cargando = true;
    this.groupsSvc.getGroupById(this.groupId!).subscribe({
      next: (res: any) => {
        const data = res.data;
        this.nombreGrupo = data.nombre;
        this.descripcionGrupo = data.descripcion;

        const user = this.authSvc.getUser();
        const currentUserId = user ? Number(user.id || user.sub) : 0;
        this.esDuenio = Number(data.creador_id) === currentUserId;

        // Regla: Creador o Admin Global
        this.canEditGroup = this.esDuenio || this.permsSvc.hasPermission('group:manage');
        this.canAddMember = this.esDuenio || this.permsSvc.hasPermission('group:edit');
        this.canDeleteMember = this.esDuenio || this.permsSvc.hasPermission('group:edit');

        this.miembros = data.miembros.map((m: any) => ({
          id: m.usuarios.id,
          nombre: m.usuarios.nombre_completo,
          username: m.usuarios.username,
          email: m.usuarios.email,
          fecha: new Date(m.fecha_unido).toLocaleDateString(),
          rol: m.usuarios.id === data.creador_id ? 'Admin' : 'Miembro'
        }));
        this.cargando = false;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el grupo.' });
        this.cargando = false;
      }
    });
  }

  abrirModalMiembro() {
    this.cargandoUsuarios = true;
    this.mostrarModalMiembro = true;
    this.usuariosSvc.getAll().subscribe({
      next: (res: any) => {
        const todos = res.data || [];
        const idsMiembros = this.miembros.map(m => m.id);
        this.usuariosSistema = todos.filter((u: any) => !idsMiembros.includes(u.id));
        this.cargandoUsuarios = false;
      }
    });
  }

  anadirUsuario(usuario: any) {
    this.groupsSvc.addMember(this.groupId!, usuario.id).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Añadido', detail: `${usuario.nombre_completo} unido.` });
        this.usuariosSistema = this.usuariosSistema.filter(u => u.id !== usuario.id);
        this.cargarDatosGrupo();
      }
    });
  }

  getRolSeverity(rol: string): any {
    return rol === 'Admin' ? 'danger' : 'info';
  }

  eliminarMiembro(miembro: any) {
    if (!this.canDeleteMember || miembro.rol === 'Admin') return;
    this.confirmSvc.confirm({
      message: `¿Remover a ${miembro.nombre}?`,
      header: 'Confirmar',
      icon: 'pi pi-user-minus',
      acceptLabel: 'Remover',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.groupsSvc.removeMember(this.groupId!, miembro.id).subscribe({
          next: () => {
            this.miembros = this.miembros.filter(m => m.id !== miembro.id);
            this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Removido.' });
          }
        });
      }
    });
  }

  abrirModalEditar() {
    this.grupoEditando = { nombre: this.nombreGrupo, descripcion: this.descripcionGrupo };
    this.mostrarModalGrupo = true;
  }

  guardarCambiosGrupo() {
    this.groupsSvc.updateGroup(this.groupId!, this.grupoEditando).subscribe({
      next: () => {
        this.nombreGrupo = this.grupoEditando.nombre;
        this.descripcionGrupo = this.grupoEditando.descripcion;
        this.mostrarModalGrupo = false;
        this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Actualizado.' });
      }
    });
  }

  // Permisos PickList
  abrirPermisosUsuario(miembro: any) {
    this.usuarioParaPermisos = miembro;
    this.permisosDialog = true;
    this.cargarPermisosActuales();
  }

  cargarPermisosActuales() {
    if (!this.groupId || !this.usuarioParaPermisos) return;
    this.groupsSvc.getUserPermissions(this.groupId, this.usuarioParaPermisos.id).subscribe({
      next: (res: any) => {
        const nombres = Array.isArray(res.data) ? res.data.map((p: any) => p.nombre || p.permisos?.nombre) : [];
        this.permisosAsignados = nombres;
        this.permisosDisponibles = this.catalogoPermisosGrupo.filter(p => !nombres.includes(p));
      }
    });
  }

  onMoveToTarget(event: any) {
    const permiso = event.items[0];
    this.groupsSvc.assignPermission(this.groupId!, this.usuarioParaPermisos.id, permiso).subscribe({
      next: () => this.cargarPermisosActuales()
    });
  }

  onMoveToSource(event: any) {
    const permiso = event.items[0];
    this.groupsSvc.revokePermission(this.groupId!, this.usuarioParaPermisos.id, permiso).subscribe({
      next: () => this.cargarPermisosActuales()
    });
  }
}