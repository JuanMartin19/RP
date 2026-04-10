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

  // Para gestión de miembros
  grupoSeleccionado: any = null;
  miembros: any[] = [];
  todosUsuarios: any[] = [];
  usuarioSeleccionado: any = null;

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
    this.canAdd = this.permsSvc.hasPermission('group:add');
    this.canEdit = this.permsSvc.hasPermission('group:edit');
    this.canDelete = this.permsSvc.hasPermission('group:delete');
    this.canManageMembers = this.permsSvc.hasPermission('group:manage');

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
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos.' });
        this.cargando = false;
      }
    });
  }

  cargarUsuarios() {
    this.usuariosSvc.getAll().subscribe({
      next: (res: any) => {
        this.todosUsuarios = Array.isArray(res.data) ? res.data : [];
      },
      error: () => {}
    });
  }

  openNew() {
    this.groupForm.reset();
    this.editingId = null;
    this.groupDialog = true;
  }

  editGroup(group: any) {
    if (!this.canEdit) return;
    this.groupForm.patchValue({
      nombre: group.nombre,
      descripcion: group.descripcion || ''
    });
    this.editingId = group.id;
    this.groupDialog = true;
  }

  saveGroup() {
    if (this.groupForm.invalid) return;
    const data = this.groupForm.value;
    this.guardando = true;

    if (this.editingId) {
      this.groupsSvc.updateGroup(this.editingId, data).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo actualizado correctamente.' });
          this.groupDialog = false;
          this.guardando = false;
          this.cargarGrupos();
        },
        error: (err) => {
          this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al actualizar.' });
          this.guardando = false;
        }
      });
    } else {
      this.groupsSvc.createGroup({ nombre: data.nombre!, descripcion: data.descripcion || '' }).subscribe({
        next: () => {
          this.messageSvc.add({ severity: 'success', summary: 'Creado', detail: 'Grupo creado correctamente.' });
          this.groupDialog = false;
          this.guardando = false;
          this.cargarGrupos();
        },
        error: (err) => {
          this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al crear.' });
          this.guardando = false;
        }
      });
    }
  }

  deleteGroup(group: any) {
    if (!this.canDelete) return;
    this.groupsSvc.deleteGroup(group.id).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Eliminado', detail: 'Grupo eliminado.' });
        this.cargarGrupos();
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el grupo.' });
      }
    });
  }

  deleteSelectedGroups() {
    if (!this.canDelete || !this.selectedGroups.length) return;
    const requests = this.selectedGroups.map(g =>
      this.groupsSvc.deleteGroup(g.id).toPromise()
    );
    Promise.all(requests).then(() => {
      this.messageSvc.add({ severity: 'success', summary: 'Eliminados', detail: 'Grupos eliminados correctamente.' });
      this.selectedGroups = [];
      this.cargarGrupos();
    }).catch(() => {
      this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar algunos grupos.' });
    });
  }

  // ---- Gestión de miembros ----
  openMembers(group: any) {
    this.grupoSeleccionado = group;
    this.usuarioSeleccionado = null;

    this.groupsSvc.getGroupById(group.id).subscribe({
      next: (res: any) => {
        this.miembros = res.data?.miembros || [];
        this.memberDialog = true;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los miembros.' });
      }
    });
  }

  agregarMiembro() {
    if (!this.usuarioSeleccionado || !this.grupoSeleccionado) return;
    this.groupsSvc.addMember(this.grupoSeleccionado.id, this.usuarioSeleccionado.id).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Agregado', detail: 'Miembro agregado correctamente.' });
        this.openMembers(this.grupoSeleccionado);
        this.usuarioSeleccionado = null;
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al agregar miembro.' });
      }
    });
  }

  removerMiembro(usuarioId: number) {
    if (!this.grupoSeleccionado) return;
    this.groupsSvc.removeMember(this.grupoSeleccionado.id, usuarioId).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Removido', detail: 'Miembro removido correctamente.' });
        this.openMembers(this.grupoSeleccionado);
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo remover el miembro.' });
      }
    });
  }

  getNombreCreador(creador_id: number): string {
    const u = this.todosUsuarios.find(u => u.id === creador_id);
    return u ? u.nombre_completo : `#${creador_id}`;
  }
}