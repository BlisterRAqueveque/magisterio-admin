import { InputComponent, TextareaComponent } from '@/app/shared';
import { Component, EventEmitter, Output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'm-articulos',
  standalone: true,
  imports: [InputComponent, TextareaComponent, TooltipModule],
  templateUrl: './articulos.component.html',
  styleUrl: './articulos.component.css',
})
export class ArticulosComponent {
  index = 0;

  art!: number;
  desc!: string;

  id!: number;

  error = false;

  /**
   * @description
   * Emite eventos para cuando se debe destruir el componente
   */
  @Output() destruir = new EventEmitter<number>();
  /**
   * @description
   * Enviamos el index del componente
   */
  onDestruir() {
    this.destruir.emit(this.index);
  }
}
