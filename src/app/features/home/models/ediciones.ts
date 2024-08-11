import { UsuarioI } from '../../login/models/usuario';
import { CasaMutualI } from './casa.mutual';
import { DelegacionI } from './delegaciones';
import { HabitacionI } from './habitaciones';
import { ParcelaI } from './parcelas';

export interface EdicionI {
  id?: number;
  descripcion: string;
  fecha_editado: Date;

  //* Agregado solo front
  objeto?: any;

  ediciones_usuarios?: UsuarioI;

  ediciones_casa_mutual?: CasaMutualI;

  ediciones_habitaciones?: HabitacionI;

  ediciones_delegaciones?: DelegacionI;

  ediciones_parcelas?: ParcelaI;
}
