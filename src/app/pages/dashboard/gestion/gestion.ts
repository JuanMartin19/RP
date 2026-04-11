// src/app/pages/dashboard/gestion/gestion.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PrimeImportsModule } from '../../../prime-imports';
import { PermissionsService } from '../../../services/permissions.service';
import { GroupsService } from '../../../services/groups.service';
import { UsuariosService } from '../../../services/usuarios.service'; 
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

  // Usuarios disponibles para añadir
  usuariosSistema: any[] = [];
  cargandoUsuarios = false;

  canEditGroup = false;
  canAddMember = false;
  canDeleteMember = false;

  mostrarModalGrupo = false;
  mostrarModalMiembro = false; 
  
  grupoEditando = { nombre: '', descripcion: '' };

  constructor(
    private route: ActivatedRoute,
    private permsSvc: PermissionsService,
    private groupsSvc: GroupsService,
    private usuariosSvc: UsuariosService,
    private messageSvc: MessageService,
    private confirmSvc: ConfirmationService
  ) {
    this.canEditGroup = this.permsSvc.hasPermission('group:edit');
    this.canAddMember = this.permsSvc.hasPermission('group:manage');
    this.canDeleteMember = this.permsSvc.hasPermission('group:manage');
  }

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
    
    // Obtenemos todos los usuarios del sistema
    this.usuariosSvc.getAll().subscribe({
      next: (res: any) => {
        const todos = res.data || [];
        // Filtramos para NO mostrar usuarios que ya son miembros del grupo
        const idsMiembros = this.miembros.map(m => m.id);
        this.usuariosSistema = todos.filter((u: any) => !idsMiembros.includes(u.id));
        this.cargandoUsuarios = false;
      },
      error: () => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios.' });
        this.cargandoUsuarios = false;
      }
    });
  }

  anadirUsuario(usuario: any) {
    this.groupsSvc.addMember(this.groupId!, usuario.id).subscribe({
      next: () => {
        this.messageSvc.add({ severity: 'success', summary: 'Añadido', detail: `${usuario.nombre_completo} ahora es parte del grupo.` });
        // Quitamos al usuario de la lista del modal localmente
        this.usuariosSistema = this.usuariosSistema.filter(u => u.id !== usuario.id);
        // Recargamos la tabla principal de miembros
        this.cargarDatosGrupo();
      },
      error: (err) => {
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'No se pudo añadir al usuario.' });
      }
    });
  }

  getRolSeverity(rol: string): any {
    return rol === 'Admin' ? 'danger' : 'info';
  }

  eliminarMiembro(miembro: any) {
    if (!this.canDeleteMember || miembro.rol === 'Admin') return;

    this.confirmSvc.confirm({
      message: `¿Deseas remover a ${miembro.nombre} del grupo?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-user-minus',
      acceptLabel: 'Remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.groupsSvc.removeMember(this.groupId!, miembro.id).subscribe({
          next: () => {
            this.miembros = this.miembros.filter(m => m.id !== miembro.id);
            this.messageSvc.add({ severity: 'success', summary: 'Completado', detail: 'Miembro removido.' });
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
        this.messageSvc.add({ severity: 'success', summary: 'Actualizado', detail: 'Grupo actualizado.' });
      }
    });
  }
}