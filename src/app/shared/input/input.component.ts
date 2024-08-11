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
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() icon!: string;
  @Input() isPassword!: boolean;
  @Input() readonly: boolean = false;

  hasFocus = false;

  value = model<any>();

  eye = 'pi-eye-slash';

  changeType() {
    this.type = this.type === 'password' ? 'text' : 'password';
    this.eye = this.eye === 'pi-eye-slash' ? 'pi-eye' : 'pi-eye-slash';
  }

  @Input() error = false;
  @Input() errorMessage = '';
}
