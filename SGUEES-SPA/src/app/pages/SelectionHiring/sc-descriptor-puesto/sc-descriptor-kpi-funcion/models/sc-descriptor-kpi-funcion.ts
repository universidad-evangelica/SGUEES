// KPI / indicador del formato corto.
export interface ScDescriptorKpiFuncion {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_KPI_FUNCION: number;
	NOMBRE_INDICADOR: string;
	CORR_FRECUENCIA?: number | null;
	NOMBRE_FRECUENCIA?: string;
	META?: number | null;
	_clientKey?: string | number;
}

// Lookup de frecuencia del KPI.
export interface ScFrecuenciaLookup {
	CORR_FRECUENCIA: number;
	NOMBRE_FRECUENCIA: string;
	/** Nombre vigente del catálogo (popup); NOMBRE_FRECUENCIA puede ser snapshot del KPI. */
	NOMBRE_FRECUENCIA_CATALOGO?: string;
}
