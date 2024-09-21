import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { BackdropService } from './backdrop.service';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ImageComponent {
  private readonly service = inject(BackdropService);

  ngOnInit() {
    const body = document.getElementById('body-principal');
    body?.classList.add('overflow-hidden');
  }

  ngOnDestroy(): void {
    const body = document.getElementById('body-principal');
    body?.classList.remove('overflow-hidden');
  }

  src = '';

  close() {
    const el = document.getElementById('backdrop');
    el?.classList.add('opacity-0');
    setTimeout(() => {
      this.service.detachComponentFromBody();
    }, 100);
  }
}
