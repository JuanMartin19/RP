import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { PrimeImportsModule } from "../../prime-imports";
import { PermissionsService } from '../../services/permissions.service';

interface Group {
  id?: number;
  nombre: string;
  nivel: string;
  autor: string;
  integrantes: number;
  tickets: number;
  descripcion: string;
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeImportsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups {

  groupDialog: boolean = false;
  groups: Group[] = [];
  groupForm: FormGroup;
  editingId: number | null = null;

  // permisos
  canAdd = false;
  canEdit = false;
  canDelete = false;

  constructor(private permsSvc: PermissionsService) {

    this.groupForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      nivel: new FormControl('', Validators.required),
      autor: new FormControl(''),
      integrantes: new FormControl(0),
      tickets: new FormControl(0),
      descripcion: new FormControl('')
    });

    // revisar permisos
    this.canAdd = this.permsSvc.hasPermission('groups:add');
    this.canEdit = this.permsSvc.hasPermission('groups:edit');
    this.canDelete = this.permsSvc.hasPermission('groups:delete');
  }

  openNew() {
    this.groupForm.reset();
    this.editingId = null;
    this.groupDialog = true;
  }

  editGroup(group: Group) {
    this.groupForm.patchValue(group);
    this.editingId = group.id!;
    this.groupDialog = true;
  }

  deleteGroup(id: number) {
    this.groups = this.groups.filter(g => g.id !== id);
  }

  saveGroup() {
    if (this.groupForm.valid) {

      const data = this.groupForm.value as Group;

      if (this.editingId) {

        this.groups = this.groups.map(g =>
          g.id === this.editingId ? { ...data, id: this.editingId } : g
        );

      } else {

        this.groups = [...this.groups, { ...data, id: Date.now() }];

      }

      this.groupDialog = false;

    }
  }
}