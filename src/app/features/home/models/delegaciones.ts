import { EdicionI } from './ediciones';
import { ReservaI } from './reservas';

export interface DelegacionI {
  id: number;
  co: number;
  nombre: string;
  tel: string;
  cel: string;
  cp: number;
  domicilio: string;
  email: string;
  horarios: string[];

  fecha_creado: Date;

  ediciones: EdicionI[];

  reservas: ReservaI[];
}
