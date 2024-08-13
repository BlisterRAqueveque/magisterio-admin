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
}
