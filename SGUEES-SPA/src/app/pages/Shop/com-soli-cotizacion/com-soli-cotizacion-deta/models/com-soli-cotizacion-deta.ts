export interface ComSoliCotizacionDeta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_SOLI_COTIZACION: number;
	CORR_SOLI_COTIZACION_DETA: number;
	CODIGO_ITEM: string;
	NOMBRE_ITEM: string;
	CANTIDAD: number;
	CORR_UNIDAD_MEDIDA: number;
	OBSERVACIONES: string;
	ESTADO_SOLI_COTIZACION: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
  SELECCION: boolean;
  CORR_DOCUMENTO: number;
  NOMBRE_ARCHIVO: string;
}
