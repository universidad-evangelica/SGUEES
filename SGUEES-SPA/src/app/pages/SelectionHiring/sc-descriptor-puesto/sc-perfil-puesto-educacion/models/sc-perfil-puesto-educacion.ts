// Educación requerida en el perfil de puesto del descriptor.
export interface ScPerfilPuestoEducacion {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el detalle.
	CORR_PERFIL_PUESTO?: number; // Perfil padre al que pertenece el detalle.
	CORR_EDUCACION: number; // Identificador del requisito de educación en base de datos.
	REQUISITO: string; // Descripción del nivel o tipo de educación requerido.
	ESPECIFICACIONES: string; // Detalle adicional (carrera, especialidad, etc.).
	TIPO_REQUERIDO: string; // Tipo de requisito (deseable, obligatorio, etc.).
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
