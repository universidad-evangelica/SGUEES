// Competencia conductual requerida en el perfil de puesto del descriptor.
export interface ScPerfilPuestoCompetenciasConductuales {
	CORR_EMPRESA?: number; // Empresa del registro.
	NOMBRE_COMPETENCIAS_CONDUCTUALES: string; // Nombre de la competencia conductual.
	DESCRIPCION?: string; // Descripción de la competencia.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el detalle.
	CORR_PERFIL_PUESTO?: number; // Perfil padre al que pertenece el detalle (parte de la llave natural).
	CORR_COMPETENCIAS_CONDUCTUALES: number | null; // Referencia al catálogo (parte de la llave natural).
	CODIGO_TIPO_PUESTO?: string; // Código del tipo de puesto asociado a la competencia.
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
