import { UsuarioI } from '../../login/models/usuario';
import { DelegacionI } from './delegaciones';

export interface ReservaI {
  id: number;
  nombre: string;
  apellido: string;
  n_socio: string;
  tel: string;
  correo: string;

  desde: Date;
  hasta: Date;

  aprobado: boolean;

  fecha_creado: Date;
  fecha_aprobado: Date;

  usuario_aprobador: UsuarioI;

  delegacion: DelegacionI;
}
