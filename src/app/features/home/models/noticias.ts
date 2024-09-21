import { UsuarioI } from '../../login/models';
import { EdicionI } from './ediciones';

export interface NoticiaI {
  id: number;
  background: string;
  title: string;
  subtitle: string;
  news: string;
  activo: boolean;
  fecha_creado: Date;
  borrado_el: Date;
  creado_por: UsuarioI;
  ediciones: EdicionI[];
}
