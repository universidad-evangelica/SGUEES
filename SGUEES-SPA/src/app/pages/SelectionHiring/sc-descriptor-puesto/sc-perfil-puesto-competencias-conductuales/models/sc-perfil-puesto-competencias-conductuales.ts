// Competencia conductual requerida en el perfil de puesto del descriptor.
export interface ScPerfilPuestoCompetenciasConductuales {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES: number; // Identificador del detalle en base de datos.
	NOMBRE_COMPETENCIAS_CONDUCTUALES: string; // Nombre de la competencia conductual.
	DESCRIPCION?: string; // Descripción de la competencia.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el detalle.
	CORR_PERFIL_PUESTO?: number; // Perfil padre al que pertenece el detalle.
	CORR_COMPETENCIAS_CONDUCTUALES: number | null; // Referencia al catálogo de competencias conductuales.
	CODIGO_TIPO_PUESTO?: string; // Código del tipo de puesto asociado a la competencia.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
