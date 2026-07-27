// Competencia técnica requerida en el perfil de puesto del descriptor.
export interface ScPerfilPuestoCompetenciasTecnicas {
	CORR_EMPRESA?: number; // Empresa del registro.
	NOMBRE_COMPETENCIAS_TECNICAS: string; // Nombre de la competencia técnica.
	DESCRIPCION?: string; // Descripción de la competencia.
	NIVEL_DOMINIO: string; // Nivel de dominio requerido (básico, intermedio, avanzado, etc.).
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el detalle.
	CORR_PERFIL_PUESTO?: number; // Perfil padre al que pertenece el detalle (parte de la llave natural).
	CORR_COMPETENCIAS_TECNICAS: number | null; // Referencia al catálogo (parte de la llave natural).
	CODIGO_COMPETENCIAS_TECNICAS?: string; // Código de la competencia (snapshot o catálogo).
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
