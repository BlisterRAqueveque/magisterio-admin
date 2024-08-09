export interface LoginResponse {
  token: {
    token: string;
    tipo_token: string;
    expira_en: number;
  };
  usuario: UsuarioI;
}

export interface UsuarioI {
  id: number;
  usuario: string;
  correo: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  clave: string;
  fecha_creado: Date;
  primer_login: Date;

  //casa_mutual: CasaMutualI[];

  //reservas_aprovadas: ReservaI[];

  //ediciones: EdicionI[];

  creado_por: UsuarioI;

  usuarios_creados: UsuarioI[];
}

export interface LoginUserDto {
  usuario: string;
  clave: string;
}
