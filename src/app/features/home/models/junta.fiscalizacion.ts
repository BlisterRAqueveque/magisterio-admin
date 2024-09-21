import { UsuarioI } from '../../login/models';
import { EdicionI } from './ediciones';

export interface JuntaFiscalizacionI {
  id: number;
  cargo: string;
  nombre: string;
  n_socio: string;
  dni: string;
  activo: boolean;

  fecha_carga: Date;

  borrado_el: Date;

  creado_por: UsuarioI;

  ediciones: EdicionI[];
}
