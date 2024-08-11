import { Component } from '@angular/core';
import { TableUsuariosComponent } from '../../components/table-usuarios/table-usuarios.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [TableUsuariosComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {}
