import { Component, Input } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { InputComponent } from '../../../../shared/input/input.component';
import { SelectComponent } from '../../../../shared/select/select.component';

@Component({
  selector: 'm-dialog-usuarios',
  standalone: true,
  imports: [DialogModule, RippleModule, InputComponent, SelectComponent],
  templateUrl: './dialog-usuarios.component.html',
  styleUrl: './dialog-usuarios.component.css',
})
export class DialogUsuariosComponent {
  @Input() visible = false;
}
