import { CasaMutualI } from './casa.mutual';
import { EdicionI } from './ediciones';

export interface HabitacionI {
  id: number;
  nombre: string;
  servicios: string[];

  casa_mutual: CasaMutualI;
  ediciones: EdicionI[];
}
