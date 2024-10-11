import { AuthService } from '@/app/core';
import { Component, inject } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'm-add-button',
  standalone: true,
  imports: [TooltipModule, RippleModule],
  templateUrl: './add-button.component.html',
  styleUrl: './add-button.component.css',
})
export class AddButtonComponent {
  private readonly auth = inject(AuthService);

  isAdmin: boolean | undefined;

  async ngOnInit() {
    this.auth.returnUserInfo().then((data) => {
      this.isAdmin = data?.admin;
    });
  }
}
