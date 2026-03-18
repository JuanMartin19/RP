import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeImportsModule } from '../../../prime-imports';
import { PermissionsService } from '../../../services/permissions.service'; // Asegúrate de la ruta

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeImportsModule],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class Gestion implements OnInit {

  nombreGrupo = 'Equipo DEV';
  miembros: any[] = [];

  // Variables de control de permisos
  canEditGroup = false;
  canAddMember = false;
  canDeleteMember = false;

  constructor(private permsSvc: PermissionsService) {
    // Usamos los permisos de tu JWT ('group:edit', 'group:add', 'group:delete')
    this.canEditGroup = this.permsSvc.hasPermission('group:edit');
    this.canAddMember = this.permsSvc.hasPermission('group:add');
    this.canDeleteMember = this.permsSvc.hasPermission('group:delete');
  }

  ngOnInit() {
    this.miembros = [
      { id: 1, nombre: 'Jonathan Cruz', email: 'jonathan@uteq.edu.mx', rol: 'Admin', fecha: '2026-01-20' },
      { id: 2, nombre: 'Emmanuel R.', email: 'emmanuel@dev.com', rol: 'Miembro', fecha: '2026-02-15' }
    ];
  }

  getRolSeverity(rol: string): any {
    return rol === 'Admin' ? 'danger' : 'info';
  }

  eliminarMiembro(miembro: any) {
    // Seguridad adicional por si se llama desde otro lado
    if (!this.canDeleteMember) return; 

    const confirmar = confirm(`¿Estás seguro de que deseas eliminar a ${miembro.nombre} del grupo?`);
    if (confirmar) {
      this.miembros = this.miembros.filter(m => m.id !== miembro.id);
    }
  }

  editarGrupo() {
    if (!this.canEditGroup) return;

    console.log('Abriendo modal para editar grupo...');
  }
}