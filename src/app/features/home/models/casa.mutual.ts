import { UsuarioI } from '../../login/models/usuario';
import { CasaHorarioI } from './delegaciones';
import { EdicionI } from './ediciones';
import { HabitacionI } from './habitaciones';
import { HorarioI } from './horarios';
import { ParcelaI } from './parcelas';

export interface CasaMutualI {
  id?: number;
  co: number;
  nombre: string;
  direccion: string;
  tel: string;
  cel: string;
  correo: string;
  cp: number;
  fecha_creado?: Date;
  activo: boolean;
  borrado_el: Date;

  creado_por: UsuarioI;
  usuarios: UsuarioI[];
  habitaciones: HabitacionI[];
  parcelas: ParcelaI[];
  horarios: HorarioI | null;

  casa_horarios: CasaHorarioI[];

  ediciones: EdicionI[];
}
