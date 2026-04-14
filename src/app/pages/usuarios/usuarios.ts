// src/app/pages/usuarios/usuarios.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';
import { UsuariosService } from '../../services/usuarios.service';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service'; // <-- IMPORTAMOS AuthService
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
  gruposDelUsuario: any[] = [];
  cargando = true;
  visible = false;
  guardando = false;
  
  // Control de Acciones
  canEdit = false;
  canDelete = false;
  
  // Poderes del Modal de Permisos
  canManageGlobalPerms = false; 
  canManageGroupPerms = false;  
  canOpenShield = false;        

  permisosDialog = false;
  usuarioSeleccionado: any = null;
  tipoGestion: 'global' | 'grupo' = 'global'; 
  grupoSeleccionado: any = null;

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

  constructor(
    private fb: FormBuilder,
    private permsSvc: PermissionsService,
    private usuariosSvc: UsuariosService,
    private groupsSvc: GroupsService,
    private authSvc: AuthService, // <-- LO INYECTAMOS AQUÍ
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
    this.canEdit = this.permsSvc.hasPermission('user:edit');
    this.canDelete = this.permsSvc.hasPermission('user:delete');
    
    // Evaluar acceso a seguridad
    this.canManageGlobalPerms = this.permsSvc.hasPermission('user:manage');
    this.canManageGroupPerms = this.permsSvc.hasPermission('group:manage') || this.permsSvc.hasPermission('group:edit');
    this.canOpenShield = this.canManageGlobalPerms || this.canManageGroupPerms;

    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.cargando = true;
    this.usuariosSvc.getAll().subscribe({
      next: (res: any) => {
        this.usuarios = res.data || [];
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  editarUsuario(usuario: any) {
    if (!this.canEdit) return; 
    this.usuarioForm.patchValue(usuario);
    this.visible = true;
  }

  guardarUsuario() {
    if (this.usuarioForm.invalid || !this.canEdit) return;
    this.guardando = true;
    const datos = this.usuarioForm.getRawValue();

    this.usuariosSvc.update(datos.id, datos).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
        this.visible = false;
        this.guardando = false;
        this.obtenerUsuarios();
      },
      error: () => this.guardando = false
    });
  }

  confirmarEliminar(usuario: any) {
    if (!this.canDelete) return; 
    this.confirmSvc.confirm({
      message: `¿Estás seguro de eliminar a ${usuario.nombre_completo}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuariosSvc.delete(usuario.id).subscribe({
          next: () => {
            // ==========================================
            // LÓGICA DE AUTO-KICK AL LOGIN
            // ==========================================
            const miUsuario = this.authSvc.getUser();
            const currentUserId = miUsuario ? Number(miUsuario.id || miUsuario.sub) : 0;
            const deletedUserId = Number(usuario.id);

            // Si se borró a sí mismo...
            if (currentUserId === deletedUserId) {
              this.messageSvc.add({ severity: 'warn', summary: 'Aviso', detail: 'Has eliminado tu propia cuenta.' });
              
              // Le damos medio segundo para que vea el mensaje y lo pateamos al login
              setTimeout(() => {
                this.authSvc.logout(); // Esta función ya borra cookies y te manda a /login
              }, 500);

            } else {
              // Si borró a alguien más, seguimos normal
              this.messageSvc.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario borrado' });
              this.obtenerUsuarios();
            }
          }
        });
      }
    });
  }

  // ---- Gestión de permisos ----
  abrirPermisos(usuario: any) {
    if (!this.canOpenShield) return; 
    this.usuarioSeleccionado = usuario;
    
    // Si no es admin global, forzamos la vista de grupo
    this.tipoGestion = this.canManageGlobalPerms ? 'global' : 'grupo';
    
    this.grupoSeleccionado = null;
    this.permisosDisponibles = [];
    this.permisosAsignados = [];
    
    this.groupsSvc.getUserGroups(usuario.id).subscribe({
      next: (res: any) => {
        this.gruposDelUsuario = res.data || [];
        this.permisosDialog = true;
        this.cargarPermisosActuales();
      }
    });
  }

  cargarPermisosActuales() {
    if (!this.usuarioSeleccionado) return;

    if (this.tipoGestion === 'global' && this.canManageGlobalPerms) {
      this.usuariosSvc.getGlobalPermissions(this.usuarioSeleccionado.id).subscribe({
        next: (res: any) => this.mapearPermisos(res.data)
      });
    } else if (this.tipoGestion === 'grupo' && this.grupoSeleccionado) {
      this.groupsSvc.getUserPermissions(this.grupoSeleccionado.id, this.usuarioSeleccionado.id).subscribe({
        next: (res: any) => this.mapearPermisos(res.data)
      });
    } else {
      this.permisosDisponibles = [];
      this.permisosAsignados = [];
    }
  }

  private mapearPermisos(data: any) {
    const nombres = Array.isArray(data) ? data.map((p: any) => p.nombre || p.permisos?.nombre) : [];
    this.permisosAsignados = nombres;
    const catalogo = (this.tipoGestion === 'global') 
      ? this.catalogoPermisos 
      : this.catalogoPermisos.filter(p => p.startsWith('ticket:') || p.startsWith('group:edit') || p === 'group:manage');
    
    this.permisosDisponibles = catalogo.filter(p => !nombres.includes(p));
  }

  onMoveToTarget(event: any) {
    const permiso = event.items[0];
    const obs = (this.tipoGestion === 'global')
      ? this.usuariosSvc.assignGlobalPermission(this.usuarioSeleccionado.id, permiso)
      : this.groupsSvc.assignPermission(this.grupoSeleccionado.id, this.usuarioSeleccionado.id, permiso);

    obs.subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Éxito', detail: `Permiso asignado` });
        setTimeout(() => this.cargarPermisosActuales(), 200); 
      }
    });
  }

  onMoveToSource(event: any) {
    const permiso = event.items[0];
    const obs = (this.tipoGestion === 'global')
      ? this.usuariosSvc.revokeGlobalPermission(this.usuarioSeleccionado.id, permiso)
      : this.groupsSvc.revokePermission(this.grupoSeleccionado.id, this.usuarioSeleccionado.id, permiso);

    obs.subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'warn', summary: 'Revocado', detail: `Permiso quitado` });
        setTimeout(() => this.cargarPermisosActuales(), 200);
      }
    });
  }

  getLastLogin(fecha: string): string {
    return fecha ? new Date(fecha).toLocaleDateString() : 'Nunca';
  }
}