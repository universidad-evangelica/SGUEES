export interface ComSoliCotizacionProveedor {
  CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_SOLI_COTIZACION: number;
	CORR_PROVEEDOR: number;
	CODIGO_PROVEEDOR: string;
	NOMBRE_PROVEEDOR: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
  SELECCION: boolean;
  ESTADO_COTIZACION: string;
  NOMBRE_ESTADO_COTIZACION: string;
  FECHA_COTIZACION: Date;
  USUARIO_COTIZA: string;
  PLAZO_ENTREGA: string;
  OBSERVACIONES: string;
  GENERAR_COTIZACION: boolean;
  CORR_FORMA_PAGO: number;
  CORR_CONDICION_PAGO: number;
}
