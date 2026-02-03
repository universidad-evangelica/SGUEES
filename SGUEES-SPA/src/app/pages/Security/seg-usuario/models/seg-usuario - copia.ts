/* eslint-disable @typescript-eslint/naming-convention */
import { SegUsuarioOpcion } from './seg-usuario-opcion';

export interface SegUsuario {
  LOGIN_SISTEMA: string;
  NOMBRE_USUARIO: string;
  CORREO_ELECTRONICO: string;
  TIPO_USUARIO: number;
  NOMBRE_TIPO_USUARIO: string;
  ESTADO_USUARIO: number;
  NOMBRE_ESTADO_USUARIO: string;
  IDIOMA: string;
  USUARIO_CREA: string;
  FECHA_CREA: Date;
  ESTACION_CREA: string;
  USUARIO_ACTU: string;
  FECHA_ACTU: Date;
  ESTACION_ACTU: string;
  USUARIO_AD: string;
  DETALLE: SegUsuarioOpcion[];
}
