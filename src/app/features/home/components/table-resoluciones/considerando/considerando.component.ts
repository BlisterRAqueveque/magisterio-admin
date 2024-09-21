import { TextareaComponent } from '@/app/shared';
import { Component, EventEmitter, Output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'm-considerando',
  standalone: true,
  imports: [TextareaComponent, TooltipModule],
  templateUrl: './considerando.component.html',
  styleUrl: './considerando.component.css',
})
export class ConsiderandoComponent {
  index!: number;

  id!: number;
  considerando!: string;
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
