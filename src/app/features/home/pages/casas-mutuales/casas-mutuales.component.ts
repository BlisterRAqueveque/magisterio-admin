import { Component } from '@angular/core';
import { TableCasasComponent } from '../../components/table-casas/table-casas.component';

@Component({
  selector: 'app-casas-mutuales',
  standalone: true,
  imports: [TableCasasComponent],
  templateUrl: './casas-mutuales.component.html',
  styleUrl: './casas-mutuales.component.css',
})
export class CasasMutualesComponent {}
