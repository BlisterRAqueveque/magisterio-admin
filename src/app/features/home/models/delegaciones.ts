import { UsuarioI } from '../../login/models';
import { CasaMutualI } from './casa.mutual';
import { EdicionI } from './ediciones';
import { ReservaI } from './reservas';

export interface DelegacionI {
  id: number;
  co: number;
  nombre: string;
  tel: string;
  cel: string;
  cp: number;
  direccion: string;
  correo: string;
  activo: boolean;
  email: string;
  horarios: string[];

  casa_horarios: CasaHorarioI[];

  fecha_creado: Date;

  ediciones: EdicionI[];

  reservas: ReservaI[];

  usuarios: UsuarioI[];
  borrado_el: Date;
  creado_por: UsuarioI;
}

export interface CasaHorarioI {
  id?: number;
  horario: string;

  casa_mutual?: CasaMutualI;

  delegacion?: DelegacionI;
}
