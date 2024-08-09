import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, inject } from '@angular/core';
import { LoaderService } from './loader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'm-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter, :leave', [animate(300)]),
    ]),
  ],
  imports: [CommonModule, FormsModule],
})
export class LoaderComponent {
  private readonly service = inject(LoaderService);

  present() {
    this.service.present();
  }

  show = true;
  dismiss() {
    this.service.dismiss();
  }
}
