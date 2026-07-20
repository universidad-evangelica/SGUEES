// Experiencia laboral requerida en el perfil de puesto del descriptor.
export interface ScPerfilPuestoExperiencia {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el detalle.
	CORR_PERFIL_PUESTO?: number; // Perfil padre al que pertenece el detalle.
	CORR_EXPERIENCIA: number; // Identificador del requisito de experiencia en base de datos.
	REQUISITO: string; // Descripción del requisito de experiencia.
	TIPO_REQUERIDO: string; // Tipo de requisito (deseable, obligatorio, etc.).
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
