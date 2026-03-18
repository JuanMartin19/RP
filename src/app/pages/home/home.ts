import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from "../../prime-imports";
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PrimeImportsModule, CommonModule], // Añadido CommonModule para usar *ngFor
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  userName = 'Juan Martin';
  grupoSeleccionado: any = null;

  canViewGruop = false;

  constructor(private router: Router,
    private permsSvc: PermissionsService
  ) {
    this.canViewGruop = this.permsSvc.hasPermission('group:view');
  }

  grupos = [
    { id: 1, nombre: "Equipo DEV", descripcion: "Equipo encargado de desarrollar", estado: "Hecho", tagClass: "tag-success" },
    { id: 2, nombre: "Soporte", descripcion: "Equipo de atención al cliente", estado: "En progreso", tagClass: "tag-info" },
    { id: 3, nombre: "UX", descripcion: "Equipo de Experiencia de usuario", estado: "Pendiente", tagClass: "tag-warning" },
    { id: 4, nombre: "QA", descripcion: "Equipo de aseguramiento de calidad", estado: "Bloqueado", tagClass: "tag-danger" }
  ];

  seleccionarGrupo(grupo: any) {
    this.grupoSeleccionado = grupo;
    this.router.navigate(['/dashboard/resumen'], {
      state: { grupo }
    });
  }
}