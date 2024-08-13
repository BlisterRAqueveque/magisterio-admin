import { Component } from '@angular/core';
import { TableReservasComponent } from '../../components/table-reservas/table-reservas.component';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [TableReservasComponent],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css',
})
export class ReservasComponent {}
