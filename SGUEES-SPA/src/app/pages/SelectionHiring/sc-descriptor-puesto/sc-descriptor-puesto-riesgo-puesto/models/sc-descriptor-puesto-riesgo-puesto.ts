// Riesgo del puesto asignado al descriptor (formato extenso).
export interface ScDescriptorPuestoRiesgoPuesto {
	CORR_EMPRESA?: number; // Empresa del registro.
	NOMBRE_RIESGO_PUESTO: string; // Nombre del riesgo (snapshot o catálogo).
	INFORMACION?: string | null; // Información adicional sobre el riesgo en el descriptor.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el riesgo.
	CORR_RIESGO_PUESTO: number | null; // Referencia al catálogo de riesgos del puesto (parte de la llave natural).
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
