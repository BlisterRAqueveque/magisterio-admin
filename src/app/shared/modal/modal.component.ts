import { CommonModule } from '@angular/common';
import { Component, ComponentRef, inject, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from './modal.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { HostService } from '../../core/host.service';

@Component({
  standalone: true,
  selector: 'old-modal-attach',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ModalComponent {
  /** @description Cabecera del modal */
  header!: string;
  /** @description Body del modal, crear un ng-template con el atributo #body */
  body!: TemplateRef<any>;
  /** @description Footer del modal, crear un ng-template con el atributo #footer */
  footer!: TemplateRef<any>;

  /** @description Instancia del servicio */
  private readonly service = inject(ModalService);

  componentRef!: ComponentRef<unknown>;

  /** @description Solo aplica los estilos para la pre destrucción del componente */
  hide = false;
  /**
   * @description
   * Destruye el componente en su totalidad
   */
  dismiss() {
    //! Aplica los estilos antes de destruir el componente
    this.hide = true;
    setTimeout(() => {
      //! Destruye el componente pasados 100ms
      this.service.dismiss(this.componentRef);
    }, 100);
  }

  /** @description Creamos una instancia del servicio host */
  private readonly host = inject(HostService);
  ngOnInit(): void {
    //! Pusheamos el componente en la lista
    this.host.components.push(this);
  }
}
