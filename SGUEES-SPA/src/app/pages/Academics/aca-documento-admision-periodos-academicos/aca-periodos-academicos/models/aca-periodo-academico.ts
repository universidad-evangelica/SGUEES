// Qué hace: tipa el período que llega del lookup y la fila del popup.
// Cómo: el lookup trae el período; el popup le agrega SELECCION.

export interface AcaPeriodoDocumento {
	CORR_EMPRESA?: number;
	CORR_PERIODO_ACADEMICO: number;
	ANIO?: number;
	NUMERO_PERIODO?: number;
	CICLO?: string;
	NOMBRE_SEDE?: string;
	NOMBRE_AREA?: string;
	NOMBRE_FACULTAD?: string;
	NOMBRE_CARRERA?: string;
	ALCANCE?: string;
	LUGAR?: string;
	FECHA_INICIO?: string;
	FECHA_FIN?: string;
	ACTIVO?: boolean;
	ACTIVO_TEXTO?: string;
}

export interface AcaPeriodoDocumentoSeleccion extends AcaPeriodoDocumento {
	SELECCION: boolean;
}
