import { Component, inject } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { Buttons } from './models/buttons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'm-sidebar',
  standalone: true,
  imports: [TooltipModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  buttons: Buttons[] = [
    {
      nombre: 'Usuarios',
      activo: false,
      link: '',
      icono: 'pi-user',
    },
    {
      nombre: 'Casas mutuales',
      activo: false,
      link: '',
      icono: 'pi-building-columns',
    },
  ];

  ngOnInit() {
    this.buttons[0].activo = true;
  }

  private readonly router = inject(Router);

  navigate(object: Buttons) {
    this.buttons.map((b) => (b.activo = false));
    object.activo = true;
    this.showSideBar = false;
    //this.router.navigate([object.link]);
  }

  showSideBar = false;
}
