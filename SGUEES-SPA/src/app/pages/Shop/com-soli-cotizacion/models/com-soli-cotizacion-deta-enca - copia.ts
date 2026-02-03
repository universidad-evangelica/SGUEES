import { ComSoliCotizacionDetaImpo } from "../com-soli-cotizacion-deta/models/com-soli-cotizaciones-deta-impo";

export interface ComSoliCotizacionDetaEnca {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_SOLI_COTIZACION: number;
	FECHA_SOLI_COTIZACION: Date;
	FECHA_LIMITE_COTIZACION: Date;
	CODIGO_DEPTO: string;
  NOMBRE_DEPTO: string;
	ANIO_PERIODO_SOLI_COMPRA: number;
	CORR_SOLI_COMPRA: number;
  FECHA_SOLICITUD_COMPRA: Date;
	USUARIO_SOLI: string;
	OBSERVACIONES: string;
	ESTADO_SOLI_COTIZACION: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
  CORR_TIPO_SOLI_COTIZA: number;
  DETA: ComSoliCotizacionDetaImpo[];
}
