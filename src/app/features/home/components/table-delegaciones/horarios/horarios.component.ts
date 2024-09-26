import { InputComponent } from '@/app/shared';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'm-horarios',
  standalone: true,
  imports: [InputComponent],
  templateUrl: './horarios.component.html',
  styleUrl: './horarios.component.css',
})
export class HorariosComponent {
  index = 0;

  horario!: string;

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
