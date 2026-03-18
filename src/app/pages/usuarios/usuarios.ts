import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule, CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {

  usuarios: any[] = [];
  
  // Catálogo maestro de todos los permisos posibles
  catalogoPermisos = [
    'groups:view', 'group:view', 'group:add', 'group:edit', 'group:delete',
    'users:view', 'user:add', 'user:view:all', 'users:add', 'user:edit', 'users:edit', 'user:delete', 'users:delete',
    'tickets:view', 'ticket:add', 'ticket:view', 'ticket:edite', 'ticket:edite:state', 'ticket:delete'
  ];

  // Variables para el PickList
  permisosDisponibles: string[] = []; // Los que NO tiene
  permisosSeleccionados: string[] = []; // Los que SI tiene

  canAddUsers = false;
  canEditUsers = false;
  canDeleteUsers = false;

  visible: boolean = false;
  usuarioForm!: FormGroup;
  editando = false;

  constructor(
    private fb: FormBuilder,
    private permsSvc: PermissionsService
  ) {
    this.usuarioForm = this.fb.group({
      id: [null],
      nombre: [''],
      email: ['']
    });

    this.canAddUsers = this.permsSvc.hasPermission('users:add');
    this.canEditUsers = this.permsSvc.hasPermission('users:edit');
    this.canDeleteUsers = this.permsSvc.hasPermission('users:delete');
  }

  ngOnInit() {
    this.usuarios = [
      { id: 1, nombre: 'Jonathan Cruz', email: 'jonathan@uteq.edu.mx', permisos: ['groups:view'] },
      { id: 2, nombre: 'Usuario Prueba', email: 'test@anteiku.com', permisos: ['groups:view'] }
    ];
  }

  abrirNuevo() {
    if (!this.canAddUsers) return;
    this.editando = false;
    this.usuarioForm.reset();
    
    // Al ser nuevo, todos los permisos están disponibles y ninguno seleccionado
    this.permisosDisponibles = [...this.catalogoPermisos];
    this.permisosSeleccionados = [];
    
    this.visible = true;
  }

  editarUsuario(usuario: any) {
    if (!this.canEditUsers) return;
    this.editando = true;
    this.usuarioForm.patchValue(usuario);

    // Lógica para repartir permisos en las dos listas del PickList
    this.permisosSeleccionados = [...usuario.permisos];
    this.permisosDisponibles = this.catalogoPermisos.filter(p => !usuario.permisos.includes(p));

    this.visible = true;
  }

  guardarUsuario() {
    const usuarioBase = this.usuarioForm.value;
    // Combinamos los datos del formulario con los permisos del PickList
    const usuarioFinal = {
        ...usuarioBase,
        permisos: [...this.permisosSeleccionados]
    };

    if (this.editando) {
      const index = this.usuarios.findIndex(u => u.id === usuarioFinal.id);
      this.usuarios[index] = usuarioFinal;
    } else {
      usuarioFinal.id = Date.now();
      this.usuarios.push(usuarioFinal);
    }
    this.visible = false;
  }

  eliminarUsuario(usuario: any) {
    if (!this.canDeleteUsers) return;
    if(confirm(`¿Eliminar al usuario ${usuario.nombre}?`)){
      this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
    }
  }
}