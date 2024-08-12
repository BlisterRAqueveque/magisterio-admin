import { CasaMutualI } from './casa.mutual';

export interface HorarioI {
  id?: number;

  inicio_periodo: Date;

  fin_periodo: Date;

  casa_mutual?: CasaMutualI;
}
