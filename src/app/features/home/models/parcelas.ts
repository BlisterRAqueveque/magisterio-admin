import { CasaMutualI } from './casa.mutual';
import { EdicionI } from './ediciones';

export interface ParcelaI {
  id: number;
  nombre: string;

  casa_mutual: CasaMutualI;

  ediciones: EdicionI[];
}
