import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../prime-imports";

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterLink, PrimeImportsModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  perfilForm = new FormGroup({
    usuario: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
  });

  mensaje = '';
  tipoMensaje: 'success' | 'error' | null = null;

  registrar() {
    this.mensaje = '';
    const v = this.perfilForm.value;

    if (!v.usuario || !v.email) {
      this.tipoMensaje = 'error';
      this.mensaje = 'El usuario y el correo son obligatorios';
      return;
    }

    console.log('Datos guardados:', v);
    this.tipoMensaje = 'success';
    this.mensaje = 'Perfil actualizado exitosamente';
  }
}