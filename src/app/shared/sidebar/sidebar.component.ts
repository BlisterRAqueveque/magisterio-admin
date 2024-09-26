import { Component, inject } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Buttons } from './models/buttons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { DialogService } from '../confirm-dialog/dialog.service';
import { AuthService } from '@/app/core';
import { UsuarioI } from '@/app/features/login/models';

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
      isWS: false,
    },
    {
      nombre: 'Casas mutuales',
      activo: false,
      link: 'casas-mutuales',
      icono: 'pi-sitemap',
      isWS: false,
    },
    {
      nombre: 'Habitaciones',
      activo: false,
      link: 'habitaciones',
      icono: 'pi-key',
      isWS: false,
    },
    {
      nombre: 'Parcelas',
      activo: false,
      link: 'parcelas',
      icono: 'pi-map-marker',
      isWS: false,
    },
    {
      nombre: 'Reservas',
      activo: false,
      link: 'reservas',
      icono: 'pi-calendar',
      isWS: false,
    },
    {
      nombre: 'Consejo directivo',
      activo: false,
      link: 'consejo',
      icono: 'pi-users',
      isWS: true,
    },
    {
      nombre: 'Junta fiscalización',
      activo: false,
      link: 'junta',
      icono: 'pi-users',
      isWS: true,
    },
    {
      nombre: 'Delegaciones',
      activo: false,
      link: 'delegaciones',
      icono: 'pi-globe',
      isWS: true,
    },
    {
      nombre: 'Noticias',
      activo: false,
      link: 'noticias',
      icono: 'pi-megaphone',
      isWS: true,
    },
    {
      nombre: 'Resoluciones',
      activo: false,
      link: 'resol',
      icono: 'pi-file-check',
      isWS: true,
    },
  ];

  private readonly auth = inject(AuthService);
  usuario!: UsuarioI | null;

  async ngOnInit() {
    this.usuario = await this.auth.returnUserInfo();
    this.buttons[0].activo = true;
    this.navigate(this.buttons[7]);
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
