import { Component } from '@angular/core';
import { LoginPanelComponent } from './components/login-panel/login-panel.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginPanelComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {}
