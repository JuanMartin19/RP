import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrimeImportsModule } from "../../prime-imports";
import { PermissionsService } from '../../services/permissions.service';

interface Group {
  id?: number;
  nombre: string;
  autor: string;
  integrantes: number;
  tickets: number;
  descripcion: string;
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule, CommonModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups implements OnInit {

  groupDialog: boolean = false;
  groups: Group[] = [];
  selectedGroups: Group[] = [];

  groupForm: FormGroup;
  editingId: number | null = null;

  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(private permsSvc: PermissionsService) {
    this.groupForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      autor: new FormControl(''),
      integrantes: new FormControl(0),
      tickets: new FormControl(0),
      descripcion: new FormControl('')
    });

    this.canAdd = this.permsSvc.hasPermission('group:add');
    this.canEdit = this.permsSvc.hasPermission('group:edit');
    this.canDelete = this.permsSvc.hasPermission('group:delete');
  }

  ngOnInit() {
    this.groups = [
      { id: 1, autor: 'Emmanuel', nombre: 'Equipo DEV', integrantes: 3, tickets: 10, descripcion: 'Equipo encargado de desarrollar' },
      { id: 2, autor: 'Jonathan', nombre: 'Soporte', integrantes: 2, tickets: 5, descripcion: 'Equipo de atención al cliente' },
      { id: 3, autor: 'Erick', nombre: 'UX', integrantes: 4, tickets: 15, descripcion: 'Equipo de Experiencia de usuario' }
    ];
  }

  openNew() {
    if (!this.canAdd) return;
    this.groupForm.reset({ integrantes: 0, tickets: 0 });
    this.editingId = null;
    this.groupDialog = true;
  }

  editGroup(group: Group) {
    if (!this.canEdit) return;
    this.groupForm.patchValue(group);
    this.editingId = group.id!;
    this.groupDialog = true;
  }

  deleteGroup(id: number) {
    if (!this.canDelete) return;
    this.groups = this.groups.filter(g => g.id !== id);
  }

  deleteSelectedGroups() {
    if (!this.canDelete) return;
    this.groups = this.groups.filter(val => !this.selectedGroups.includes(val));
    this.selectedGroups = [];
  }

  saveGroup() {
    if (this.groupForm.invalid) return;
    const data = this.groupForm.value as Group;

    if (this.editingId) {
      this.groups = this.groups.map(g => g.id === this.editingId ? { ...data, id: this.editingId } : g);
    } else {
      if (!this.canAdd) return;
      this.groups = [...this.groups, { ...data, id: Date.now() }];
    }
    this.groupDialog = false;
  }
}