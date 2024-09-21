import { CommonModule } from '@angular/common';
import { Component, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'm-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
})
export class TextareaComponent {
  @Input() label!: string;
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;

  hasFocus = false;

  value = model<any>();

  @Input() error = false;
  @Input() errorMessage = '';
}
