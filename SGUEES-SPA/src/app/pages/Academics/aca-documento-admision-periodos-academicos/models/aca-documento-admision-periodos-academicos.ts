// Qué hace: tipa el documento del browse y la marca guardada.
// Cómo: el período del popup vive en la subcarpeta aca-periodos-academicos.

export interface AcaDocumentoPeriodo {
	CORR_DOCUMENTO_ADMISION: number;
	CODIGO: string;
	NOMBRE_DOCUMENTO: string;
	ORDEN: number;
	OBLIGATORIO?: boolean;
	ACTIVO?: boolean;
	CANT_PERIODOS: number;
}

export interface AcaDocumentoPeriodoAsignacion {
	CORR_EMPRESA: number;
	CORR_DOCUMENTO_ADMISION: number;
	CORR_PERIODO_ACADEMICO: number;
	CODIGO?: string;
	NOMBRE_DOCUMENTO?: string;
	CICLO?: string;
	NOMBRE_SEDE?: string;
	ALCANCE?: string;
	LUGAR?: string;
}
