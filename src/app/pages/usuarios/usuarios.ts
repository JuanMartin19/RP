import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../prime-imports';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule],
  templateUrl: './usuarios.html',
})
export class Usuarios {

  usuarios: any[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@mail.com',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'Ana López',
      email: 'ana@mail.com',
      estado: 'Inactivo'
    }
  ];

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
      email: [''],
      estado: ['Activo']
    });

    this.canAddUsers = this.permsSvc.hasPermission('users:add');
    this.canEditUsers = this.permsSvc.hasPermission('users:edit');
    this.canDeleteUsers = this.permsSvc.hasPermission('users:delete');

  }

  abrirNuevo() {
    this.editando = false;
    this.usuarioForm.reset();
    this.visible = true;
  }

  editarUsuario(usuario: any) {
    this.editando = true;
    this.usuarioForm.patchValue(usuario);
    this.visible = true;
  }

  guardarUsuario() {
    const usuario = this.usuarioForm.value;

    if (this.editando) {

      const index = this.usuarios.findIndex(u => u.id === usuario.id);
      this.usuarios[index] = usuario;

    } else {

      usuario.id = Date.now();
      this.usuarios.push(usuario);

    }

    this.visible = false;
  }

  eliminarUsuario(usuario: any) {
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
  }
}