import { CommonModule } from '@angular/common';
import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'm-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
})
export class InputComponent {
  @Input() type: string = 'text';
  @Input() placeholder: string = 'placeholder';
  @Input() icon!: string;
  @Input() isPassword!: boolean;

  value = model<any>();

  eye = 'pi-eye-slash';

  changeType() {
    this.type = this.type === 'password' ? 'text' : 'password';
    this.eye = this.eye === 'pi-eye-slash' ? 'pi-eye' : 'pi-eye-slash';
  }
}
