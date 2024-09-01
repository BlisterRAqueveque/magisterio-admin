import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { HostService } from './core/services/host.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly primengConfig = inject(PrimeNGConfig);

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  /** @description Instancia del servicio que contiene la lista de componentes que van a escuchar el keydown.escape */
  host = inject(HostService);
  /** @description Utilizamos el HostListener para escuchar el keydown */
  @HostListener('window:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //* Instanciamos el último componente creado
    const component = this.host.components[this.host.components.length - 1];
    if (component) {
      //! Todas las funciones se deben llamar como está para que funcione
      //* Destruimos el componente
      component.dismiss();
      //? Lo quitamos de la lista
      this.host.components.pop();
    }
  }
}
