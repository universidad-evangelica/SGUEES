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

export interface ScFrecuenciaLookup {
	CORR_FRECUENCIA: number;
	NOMBRE_FRECUENCIA: string;
}
