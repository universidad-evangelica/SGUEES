export interface ComCotizacionComentario {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_COTIZACION: number;
	CORR_COMENTARIO: number;
  CLASE_COMENTARIO: string;
	COMENTARIO: string;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
}
