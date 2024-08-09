import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { DialogService } from './dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ConfirmDialogComponent {
  private readonly service = inject(DialogService);

  ngOnInit() {
    const body = document.getElementById('body-principal');
    body?.classList.add('overflow-hidden');
  }

  ngOnDestroy(): void {
    const body = document.getElementById('body-principal');
    body?.classList.remove('overflow-hidden');
  }

  present() {
    const body = document.getElementById('body-principal');
    body?.classList.add('overflow-hidden');
  }

  close() {
    const el = document.getElementById('backdrop');
    el?.classList.add('opacity-0');
    setTimeout(() => {
      this.service.dismiss();
    }, 100);
  }

  error = false;
  haveConfirmButton = true;
  fx!: Function;
  message = 'Cuerpo del diálogo';
  header = 'Cabecera del diálogo';

  confirmAction() {
    if (this.fx) this.fx();
    this.close();
  }

  //! We need to create this event in here, because don't work from app.component.ts
  @HostListener('click', ['$event'])
  private onClick(event: MouseEvent) {
    //? Get the clicked element
    const clickedElement = event.target as HTMLElement;
    //? If it's a button, then:
    if (clickedElement.tagName.toLowerCase() === 'button') {
      //? Creates a span element inside
      let ripple = document.createElement('span');
      ripple.classList.add('ripple');
      //* ---------->
      clickedElement.appendChild(ripple);
      //? Get the element position & the pointer as well
      let rect = clickedElement.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      //? Position the span element
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      //? At least, remove span after 0.3s
      setTimeout(() => {
        ripple.remove();
      }, 300);
    }
  }
}
