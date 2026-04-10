import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';
import { UsuariosService } from '../../services/usuarios.service';
import { GroupsService } from '../../services/groups.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, PrimeImportsModule, CommonModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  usuarios: any[] = [];
  grupos: any[] = [];
  cargando = true;
  visible = false;
  editando = false;
  guardando = false;
  gruposDelUsuario: any[] = [];

  // Para gestión de permisos por grupo
  permisosDialog = false;
  usuarioSeleccionado: any = null;
  grupoSeleccionado: any = null;
  permisosDelUsuario: string[] = [];
  permisosDisponibles: string[] = [];
  permisosAsignados: string[] = [];

  catalogoPermisos = [
    'user:view', 'user:add', 'user:edit', 'user:edit:profile',
    'user:delete', 'user:manage',
    'group:view', 'group:add', 'group:edit', 'group:delete', 'group:manage',
    'ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete',
    'ticket:edit:state', 'ticket:edit:comment', 'ticket:manage'
  ];

  usuarioForm: FormGroup;

  canManage = false;

  constructor(
    private fb: FormBuilder,
    private permsSvc: PermissionsService,
    private usuariosSvc: UsuariosService,
    private groupsSvc: GroupsService,
    private messageSvc: MessageService,
    private confirmSvc: ConfirmationService
  ) {
    this.usuarioForm = this.fb.group({
      id: [null],
      nombre_completo: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: [{ value: '', disabled: true }],
      direccion: [''],
      telefono: ['']
    });
  }

  ngOnInit() {
    this.canManage = this.permsSvc.hasPermission('user:manage');
    this.obtenerUsuarios();
    this.obtenerGrupos();
  }

  obtenerUsuarios() {
    this.cargando = true;
    this.usuariosSvc.getAll().subscribe({
      next: (res: any) => {
        this.usuarios = Array.isArray(res.data) ? res.data : [];
        this.cargando = false;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.' });
        this.cargando = false;
      }
    });
  }

  obtenerGrupos() {
    this.groupsSvc.getAllGroups().subscribe({
      next: (res: any) => {
        this.grupos = Array.isArray(res.data) ? res.data : [];
      },
      error: () => {}
    });
  }

  editarUsuario(usuario: any) {
    if (!this.canManage) return;
    this.editando = true;
    this.usuarioForm.patchValue({
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      username: usuario.username,
      email: usuario.email,
      direccion: usuario.direccion || '',
      telefono: usuario.telefono || ''
    });
    this.visible = true;
  }

  guardarUsuario() {
    if (this.usuarioForm.invalid) return;
    this.guardando = true;
    const datos = this.usuarioForm.getRawValue();

    this.usuariosSvc.update(datos.id, {
      nombre_completo: datos.nombre_completo,
      username: datos.username,
      direccion: datos.direccion || null,
      telefono: datos.telefono || null
    }).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Actualizado', detail: 'Usuario actualizado correctamente.' });
        this.obtenerUsuarios();
        this.visible = false;
        this.guardando = false;
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al actualizar.' });
        this.guardando = false;
      }
    });
  }

  confirmarEliminar(usuario: any) {
    if (!this.canManage) return;
    this.confirmSvc.confirm({
      message: `¿Estás seguro de eliminar a ${usuario.nombre_completo}? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuariosSvc.delete(usuario.id).subscribe({
          next: () => {
            this.messageSvc.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado correctamente.' });
            this.obtenerUsuarios();
          },
          error: () => {
            this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
          }
        });
      }
    });
  }

  // ---- Gestión de permisos por grupo ----
  abrirPermisos(usuario: any) {
    if (!this.canManage) return;
    this.usuarioSeleccionado = usuario;
    this.grupoSeleccionado = null;
    this.permisosAsignados = [];
    this.permisosDisponibles = [...this.catalogoPermisos];
    this.gruposDelUsuario = []; // Limpiamos la lista anterior

    // Consultamos SOLO los grupos a los que pertenece el usuario
    this.groupsSvc.getUserGroups(usuario.id).subscribe({
      next: (res: any) => {
        // Asumiendo que tu backend devuelve la lista en res.data
        this.gruposDelUsuario = Array.isArray(res.data) ? res.data : [];
        
        // Abrimos el modal HASTA que ya tenemos los grupos cargados
        this.permisosDialog = true;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los grupos del usuario.' });
      }
    });
  }

  onGrupoChange() {
    if (!this.grupoSeleccionado || !this.usuarioSeleccionado) return;

    this.groupsSvc.getUserPermissions(this.grupoSeleccionado.id, this.usuarioSeleccionado.id).subscribe({
      next: (res: any) => {
        const permisosTiene = Array.isArray(res.data)
          ? res.data.map((p: any) => p.nombre)
          : [];
        this.permisosAsignados = permisosTiene;
        this.permisosDisponibles = this.catalogoPermisos.filter(p => !permisosTiene.includes(p));
      },
      error: () => {
        this.permisosAsignados = [];
        this.permisosDisponibles = [...this.catalogoPermisos];
      }
    });
  }

  asignarPermiso(permiso: string) {
    if (!this.grupoSeleccionado || !this.usuarioSeleccionado) return;

    this.groupsSvc.assignPermission(
      this.grupoSeleccionado.id,
      this.usuarioSeleccionado.id,
      permiso
    ).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Asignado', detail: `Permiso ${permiso} asignado.` });
        this.onGrupoChange();
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: err.error?.data?.message || 'Error al asignar permiso.' });
      }
    });
  }

  revocarPermiso(permiso: string) {
    if (!this.grupoSeleccionado || !this.usuarioSeleccionado) return;

    this.groupsSvc.revokePermission(
      this.grupoSeleccionado.id,
      this.usuarioSeleccionado.id,
      permiso
    ).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'warn', summary: 'Revocado', detail: `Permiso ${permiso} revocado.` });
        this.onGrupoChange();
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Error al revocar permiso.' });
      }
    });
  }

  getLastLogin(fecha: string): string {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  getPermisosPorCategoria(categoria: string): string[] {
    return this.catalogoPermisos.filter(p => p.startsWith(categoria + ':'));
  }

  togglePermiso(permiso: string) {
    if (this.permisosAsignados.includes(permiso)) {
      this.revocarPermiso(permiso);
    } else {
      this.asignarPermiso(permiso);
    }
  }

  // --- NUEVOS MÉTODOS PARA EL DISEÑO DE CHIPS (PANEL VISUAL) ---
  asignarPermisoChip(permiso: string) {
    // Primero, hacemos la actualización visual inmediata para que sea fluido
    this.permisosDisponibles = this.permisosDisponibles.filter(p => p !== permiso);
    this.permisosAsignados.push(permiso);
    this.permisosAsignados.sort();

    // Luego, enviamos la petición al servidor usando tu método existente
    this.asignarPermiso(permiso);
  }

  removerPermisoChip(permiso: string) {
    // Primero, actualización visual
    this.permisosAsignados = this.permisosAsignados.filter(p => p !== permiso);
    this.permisosDisponibles.push(permiso);
    this.permisosDisponibles.sort();

    // Luego, enviamos la petición
    this.revocarPermiso(permiso);
  }
}