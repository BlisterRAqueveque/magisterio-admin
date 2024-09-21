import { UsuarioI } from '../../login/models';
import { EdicionI } from './ediciones';

export interface ResolucionI {
  id: number;
  resol: string;
  lugar: string;
  fecha: string;
  visto: string;
  activo: boolean;
  consideraciones: ConsideracionI[];
  fecha_carga: Date;
  borrado_el: Date;
  creado_por: UsuarioI;
  ediciones: EdicionI[];
  articulos: ArticuloI[];
}

export interface ArticuloI {
  id?: number;

  art: number;

  desc: string;

  fecha_carga?: Date;

  resolucion?: ResolucionI;
}

export interface ConsideracionI {
  id?: number;
  consideracion: string;
  resolucion?: ResolucionI;
}
