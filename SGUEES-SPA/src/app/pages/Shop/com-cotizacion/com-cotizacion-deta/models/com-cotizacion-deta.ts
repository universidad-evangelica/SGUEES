export interface ComCotizacionDeta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_COTIZACION: number;
	CORR_COTIZACION_DETA: number;
	CODIGO_ITEM: string;
  NOMBRE_ITEM: string;
	CANTIDAD: number;
	CORR_UNIDAD_MEDIDA: number;
	PRECIO_UNITARIO: number;
	MONTO_SUBTOTAL: number;
	OBSERVACIONES: string;
	MARCA: string;
	ESTADO_SOLI_COTIZACION: string;
	NOMBRE_ESTADO_SOLI_COTIZACION: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
  CORR_DOCUMENTO: number;
  NOMBRE_ARCHIVO: string;
}
