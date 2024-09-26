import { Component } from '@angular/core';
import { TableDelegacionesComponent } from '../../components';

@Component({
  selector: 'app-delegaciones',
  standalone: true,
  imports: [TableDelegacionesComponent],
  templateUrl: './delegaciones.component.html',
  styleUrl: './delegaciones.component.css',
})
export class DelegacionesComponent {}
