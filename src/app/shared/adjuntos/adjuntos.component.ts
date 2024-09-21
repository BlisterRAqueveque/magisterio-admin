import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BackdropService } from './image/backdrop.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'm-adjuntos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adjuntos.component.html',
  styleUrl: './adjuntos.component.css',
})
export class AdjuntosComponent {
  uploadFile(event: any) {
    event.preventDefault();
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target!.result !== null ? e.target!.result : '';
        this.img = imageUrl.toString();
        this.setImage.emit({ img: imageUrl.toString(), type: file.type });
        file.type;
        this.name = file.name;
      };
      reader.readAsDataURL(file);
    } else {
      this.img = '';
      console.log('No file');
    }
  }

  name = '';
  @Input() img = '';
  @Input() readonly = false;

  @Output() setImage = new EventEmitter<{ img: string; type: string }>();

  service = inject(BackdropService);

  showImage() {
    this.service.appendComponentToBody(this.img);
  }
}
