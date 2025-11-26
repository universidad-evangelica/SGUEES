export interface ComSoliCotizacionDetaImpo {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_SOLI_COTIZACION: number;
	CORR_SOLI_COTIZACION_DETA: number;
	CODIGO_ITEM: string;
	NOMBRE_ITEM: string;
	CANTIDAD: number;
  CORR_UNIDAD_MEDIDA: number;
	NOMBRE_UNIDAD_MEDIDA: string;
	OBSERVACIONES: string;
	ESTADO_SOLI_COTIZACION: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
  SELECCION: boolean;
}
