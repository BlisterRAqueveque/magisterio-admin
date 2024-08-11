import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HostService {
  /**
   * @description
   * Creamos una lista con los componentes que se van instanciando
   */
  components: any[] = [];
}
