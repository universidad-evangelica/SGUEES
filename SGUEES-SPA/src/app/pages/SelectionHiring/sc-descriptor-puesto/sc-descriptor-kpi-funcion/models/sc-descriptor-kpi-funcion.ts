// KPI / indicador del formato corto asociado al descriptor de puesto.
export interface ScDescriptorKpiFuncion {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el KPI.
	CORR_KPI_FUNCION: number; // Identificador del KPI en base de datos.
	NOMBRE_INDICADOR: string; // Nombre del indicador de desempeño.
	CORR_FRECUENCIA?: number | null; // Catálogo de frecuencia de medición.
	NOMBRE_FRECUENCIA?: string; // Nombre de la frecuencia (snapshot o catálogo).
	META?: number | null; // Valor meta numérico del indicador.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}

// Lookup de frecuencia del KPI (mensual, trimestral, etc.).
export interface ScFrecuenciaLookup {
	CORR_FRECUENCIA: number; // Identificador de la frecuencia.
	NOMBRE_FRECUENCIA: string; // Nombre mostrado en el valor cerrado (puede ser snapshot del KPI).
	// Nombre vigente del catálogo (popup); NOMBRE_FRECUENCIA puede ser snapshot del KPI.
	NOMBRE_FRECUENCIA_CATALOGO?: string;
}
