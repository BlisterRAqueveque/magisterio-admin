import { Component } from '@angular/core';
import { TableParcelasComponent } from '../../components';

@Component({
  selector: 'app-parcelas',
  standalone: true,
  imports: [TableParcelasComponent],
  templateUrl: './parcelas.component.html',
  styleUrl: './parcelas.component.css',
})
export class ParcelasComponent {}
