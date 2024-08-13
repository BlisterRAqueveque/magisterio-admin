import { Component, inject } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Buttons } from './models/buttons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

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
  ];

  ngOnInit() {
    this.buttons[1].activo = true;
    this.navigate(this.buttons[1]);
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
}
