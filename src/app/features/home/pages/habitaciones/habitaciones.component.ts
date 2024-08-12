import { Component } from '@angular/core';
import { TableHabitacionesComponent } from '../../components/table-habitaciones/table-habitaciones.component';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [TableHabitacionesComponent],
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.css',
})
export class HabitacionesComponent {}
