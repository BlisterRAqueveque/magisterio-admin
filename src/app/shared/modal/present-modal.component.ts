import { CommonModule } from '@angular/common';
import {
  Component,
  ComponentRef,
  ContentChild,
  inject,
  Input,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from './modal.service';

@Component({
  standalone: true,
  selector: 'm-modal',
  templateUrl: './present-modal.component.html',
  imports: [CommonModule, FormsModule],
})
export class PresentModal {
  @Input() header!: string;
  @ContentChild('body') body!: TemplateRef<any>;
  @ContentChild('footer') footer!: TemplateRef<any>;

  private readonly service = inject(ModalService);

  present() {
    this.componentRef = this.service.present(
      this.header,
      this.body,
      this.footer
    );
  }

  componentRef!: ComponentRef<unknown>;

  dismiss() {
    this.service.dismiss(this.componentRef);
  }
}
