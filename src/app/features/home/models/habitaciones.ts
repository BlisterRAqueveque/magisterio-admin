import { UsuarioI } from '../../login/models/usuario';
import { CasaMutualI } from './casa.mutual';
import { EdicionI } from './ediciones';
import { ReservaI } from './reservas';

export interface HabitacionI {
  id: number;
  nombre: string;
  servicios: string[];
  borrado_el: Date;
  activo: boolean;
  fecha_creado: Date;

  casa_mutual: CasaMutualI;
  creado_por: UsuarioI;
  ediciones: EdicionI[];
  reservas: ReservaI[];
}
