import { Component } from '@angular/core';
import { TableNoticiasComponent } from '../../components';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [TableNoticiasComponent],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.css',
})
export class NoticiasComponent {}
