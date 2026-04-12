// src/app/pages/groups/groups.ts
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from "../../prime-imports";
import { PermissionsService } from '../../services/permissions.service';
import { GroupsService } from '../../services/groups.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule, CommonModule],
  providers: [MessageService],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups implements OnInit {

  groupDialog = false;
  memberDialog = false;
  groups: any[] = [];
  selectedGroups: any[] = [];
  cargando = true;
  guardando = false;
  editingId: number | null = null;

  grupoSeleccionado: any = null;
  miembros: any[] = [];
  todosUsuarios: any[] = [];
  usuarioSeleccionado: any = null;

  // PERMISOS TOTALMENTE GLOBALES OTRA VEZ 💀
  canAdd = false;
  canEdit = false;
  canDelete = false;
  canManageMembers = false;

  groupForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl('')
  });

  constructor(
    private permsSvc: PermissionsService,
    private groupsSvc: GroupsService,
    private usuariosSvc: UsuariosService,
    private authSvc: AuthService,
    private messageSvc: MessageService
  ) {}

  ngOnInit() {
    // Volvemos a la lógica original: solo si el sistema te dio el permiso global
    this.canAdd = this.permsSvc.hasPermission('group:add');
    this.canEdit = this.permsSvc.hasPermission('group:edit');
    this.canDelete = this.permsSvc.hasPermission('group:delete');
    this.canManageMembers = this.permsSvc.hasPermission('group:edit');

    this.cargarGrupos();
    this.cargarUsuarios();
  }

  cargarGrupos() {
    this.cargando = true;
    this.groupsSvc.getAllGroups().subscribe({
      next: (res: any) => {
        this.groups = Array.isArray(res.data) ? res.data : [];
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  cargarUsuarios() {
    this.usuariosSvc.getAll().subscribe({
      next: (res: any) => {
        this.todosUsuarios = Array.isArray(res.data) ? res.data : [];
      }
    });
  }

  openNew() {
    if (!this.canAdd) return;
    this.groupForm.reset();
    this.editingId = null;
    this.groupDialog = true;
  }

  editGroup(group: any) {
    if (!this.canEdit) return; // Bloqueado si no es Admin Global
    this.groupForm.patchValue({
      nombre: group.nombre,
      descripcion: group.descripcion || ''
    });
    this.editingId = group.id;
    this.groupDialog = true;
  }

  saveGroup() {
    if (this.groupForm.invalid || (this.editingId ? !this.canEdit : !this.canAdd)) return;
    this.guardando = true;
    const data = this.groupForm.value;

    if (this.editingId) {
      this.groupsSvc.updateGroup(this.editingId, data).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo actualizado.' });
          this.groupDialog = false;
          this.guardando = false;
          this.cargarGrupos();
        },
        error: () => this.guardando = false
      });
    } else {
      this.groupsSvc.createGroup({ nombre: data.nombre!, descripcion: data.descripcion || '' }).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Creado', detail: 'Grupo creado.' });
          this.groupDialog = false;
          this.guardando = false;
          this.cargarGrupos();
        },
        error: () => this.guardando = false
      });
    }
  }

  deleteGroup(group: any) {
    if (!this.canDelete) return; // Bloqueado si no es Admin Global
    this.groupsSvc.deleteGroup(group.id).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Eliminado', detail: 'Grupo eliminado.' });
        this.cargarGrupos();
      }
    });
  }

  deleteSelectedGroups() {
    if (!this.canDelete || !this.selectedGroups.length) return;
    const peticiones = this.selectedGroups.map(g => this.groupsSvc.deleteGroup(g.id).toPromise());
    Promise.all(peticiones).then(() => {
      this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Grupos eliminados' });
      this.selectedGroups = [];
      this.cargarGrupos();
    });
  }

  openMembers(group: any) {
    if (!this.canManageMembers) return; // Bloqueado si no es Admin Global
    this.grupoSeleccionado = group;
    this.usuarioSeleccionado = null;
    this.groupsSvc.getGroupById(group.id).subscribe({
      next: (res: any) => {
        this.miembros = res.data?.miembros || [];
        this.memberDialog = true;
      }
    });
  }

  agregarMiembro() {
    if (!this.canManageMembers || !this.usuarioSeleccionado) return;
    this.groupsSvc.addMember(this.grupoSeleccionado.id, this.usuarioSeleccionado.id).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Agregado', detail: 'Miembro añadido.' });
        this.openMembers(this.grupoSeleccionado);
      }
    });
  }

  removerMiembro(usuarioId: number) {
    if (!this.canManageMembers) return;
    this.groupsSvc.removeMember(this.grupoSeleccionado.id, usuarioId).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Removido', detail: 'Miembro quitado.' });
        this.openMembers(this.grupoSeleccionado);
      }
    });
  }

  getNombreCreador(creador_id: number): string {
    const u = this.todosUsuarios.find(user => user.id === creador_id);
    return u ? u.nombre_completo : `#${creador_id}`;
  }
}