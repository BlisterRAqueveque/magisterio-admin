import { Component } from '@angular/core';
import { TableConsejoComponent } from '../../components';

@Component({
  selector: 'app-consejo-directivo',
  standalone: true,
  imports: [TableConsejoComponent],
  templateUrl: './consejo-directivo.component.html',
  styleUrl: './consejo-directivo.component.css',
})
export class ConsejoDirectivoComponent {}
