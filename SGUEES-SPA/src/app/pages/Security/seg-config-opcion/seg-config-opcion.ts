/* eslint-disable @typescript-eslint/naming-convention */
export interface SegConfigOpcion {
  CODIGO_SISTEMA: string;
  NOMBRE_SISTEMA: string;
  IMAGEN_SISTEMA: string;
  CODIGO_MENU: string;
  NOMBRE_MENU: string;
  IMAGEN_MENU: string;
  CODIGO_OPCION: string;
  NOMBRE_OPCION: string;
  IMAGEN_OPCION: string;
  URL_OPCION: string;
  ORDEN_SISTEMA: number;
  ORDEN_MENU: number;
  ORDEN_OPCION: number;
  USUARIO_CREA: string;
  FECHA_CREA: Date;
  ESTACION_CREA: string;
  USUARIO_ACTU: string;
  FECHA_ACTU: Date;
  ESTACION_ACTU: string;
}
