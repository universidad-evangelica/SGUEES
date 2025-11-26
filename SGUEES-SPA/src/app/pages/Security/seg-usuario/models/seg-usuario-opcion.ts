/* eslint-disable @typescript-eslint/naming-convention */
export interface SegUsuarioOpcion {
  LOGIN_SISTEMA: string;
  CORR_SUSCRIPCION: number;
  CORR_CONFI_PAIS: number;
  CODIGO_SISTEMA: string;
  CODIGO_MENU: string;
  CODIGO_OPCION: string;
  NUEVO: boolean;
  MODIFICAR: boolean;
  ELIMINAR: boolean;
  IMPRIMIR: boolean;
  USUARIO_CREA: string;
  FECHA_CREA: Date;
  ESTACION_CREA: string;
  USUARIO_ACTU: string;
  FECHA_ACTU: Date;
  ESTACION_ACTU: string;
  SELECCION: boolean;
  MTTO: number;
}
