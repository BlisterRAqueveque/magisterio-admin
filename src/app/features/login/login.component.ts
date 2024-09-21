import { Component, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { LoginPanelComponent } from './components/login-panel/login-panel.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginPanelComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  cookies = inject(CookieService);
  router = inject(Router);
  ngOnInit() {
    const token = this.cookies.get('x-token');

    if (token) this.router.navigate(['/home']);
  }
}
