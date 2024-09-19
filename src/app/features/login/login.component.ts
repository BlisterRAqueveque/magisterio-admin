import { Component, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { LoginPanelComponent } from './components/login-panel/login-panel.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginPanelComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  cookies = inject(CookieService);
  ngOnInit() {
    const token = this.cookies.get('x-token');
  }
}
