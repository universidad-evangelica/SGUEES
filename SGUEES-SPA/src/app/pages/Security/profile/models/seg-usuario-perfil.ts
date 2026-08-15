export interface SegUsuarioPerfil {
  LOGIN_SISTEMA: string;
  NOMBRE_USUARIO: string;
  CORREO_ELECTRONICO: string;
  NOMBRE_EMPRESA: string;
  CORR_EMPRESA: number;
  NOMBRE_ESTADO_USUARIO: string;
  NOMBRE_TIPO_USUARIO: string;
  CODIGO_SUITE: string;
  NOMBRE_INSTANCIA: string;
  SESION_DESCRIPCION: string;
  FECHA_ULTIMO_ACCESO?: string | Date | null;
}
