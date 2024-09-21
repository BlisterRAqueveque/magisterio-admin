import { Component } from '@angular/core';
import { TableUsuariosComponent } from '../../components';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [TableUsuariosComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent {}
