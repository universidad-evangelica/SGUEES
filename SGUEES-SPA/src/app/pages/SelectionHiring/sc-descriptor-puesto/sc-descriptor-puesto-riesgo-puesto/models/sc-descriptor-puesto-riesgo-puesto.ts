// Riesgo del puesto asignado al descriptor (formato extenso).
export interface ScDescriptorPuestoRiesgoPuesto {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_RIESGO: number; // Identificador del detalle de riesgo en base de datos.
	NOMBRE_RIESGO_PUESTO: string; // Nombre del riesgo (snapshot o catálogo).
	INFORMACION?: string | null; // Información adicional sobre el riesgo en el descriptor.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el riesgo.
	CORR_RIESGO_PUESTO: number | null; // Referencia al catálogo de riesgos del puesto.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
