import { Component, inject } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Buttons } from './models/buttons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UsuarioI } from '../../features/login/models/usuario';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../confirm-dialog/dialog.service';

@Component({
  selector: 'm-sidebar',
  standalone: true,
  imports: [TooltipModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class SidebarComponent {
  buttons: Buttons[] = [
    {
      nombre: 'Usuarios',
      activo: false,
      link: 'usuarios',
      icono: 'pi-user',
    },
    {
      nombre: 'Casas mutuales',
      activo: false,
      link: 'casas-mutuales',
      icono: 'pi-sitemap',
    },
    {
      nombre: 'Habitaciones',
      activo: false,
      link: 'habitaciones',
      icono: 'pi-key',
    },
    {
      nombre: 'Parcelas',
      activo: false,
      link: 'parcelas',
      icono: 'pi-map-marker',
    },
    {
      nombre: 'Reservas',
      activo: false,
      link: 'reservas',
      icono: 'pi-calendar',
    },
  ];

  private readonly auth = inject(AuthService);
  usuario!: UsuarioI | null;

  async ngOnInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.buttons[0].activo = true;
    this.navigate(this.buttons[0]);
  }

  private readonly router = inject(Router);

  navigate(object: Buttons) {
    this.buttons.map((b) => (b.activo = false));
    object.activo = true;
    this.showSideBar = false;
    this.router.navigate([`/home/${object.link}`]);
  }

  showSideBar = false;

  resize = false;

  show = false;

  private readonly dialog = inject(DialogService);
  logout() {
    this.dialog.present(
      'Confirmación de carga',
      '¿Está seguro/a de cerrar la sesión?',
      () => {
        this.auth.logout();
      }
    );
  }
}
