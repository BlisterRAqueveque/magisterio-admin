import { UsuarioI } from '../../login/models/usuario';
import { CasaMutualI } from './casa.mutual';
import { EdicionI } from './ediciones';

export interface ParcelaI {
  id: number;
  nombre: string;
  fecha_creado: Date;
  activo: boolean;

  borrado_el: Date;

  creado_por: UsuarioI;

  casa_mutual: CasaMutualI;

  ediciones: EdicionI[];

  ingresos: IngresoParcelaI[];
}

export interface IngresoParcelaI {
  id: number;

  n_socio: string;
  nombre: string;
  nombre_salida: string;

  ingreso_fecha: Date;
  salida_fecha: Date;

  cerrado_por: UsuarioI;

  parcela: ParcelaI;
}
