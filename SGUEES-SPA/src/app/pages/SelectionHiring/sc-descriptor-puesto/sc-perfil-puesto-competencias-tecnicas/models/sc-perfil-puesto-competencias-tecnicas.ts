// Competencia técnica requerida en el perfil de puesto del descriptor.
export interface ScPerfilPuestoCompetenciasTecnicas {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS: number; // Identificador del detalle en base de datos.
	NOMBRE_COMPETENCIAS_TECNICAS: string; // Nombre de la competencia técnica.
	DESCRIPCION?: string; // Descripción de la competencia.
	NIVEL_DOMINIO: string; // Nivel de dominio requerido (básico, intermedio, avanzado, etc.).
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el detalle.
	CORR_PERFIL_PUESTO?: number; // Perfil padre al que pertenece el detalle.
	CORR_COMPETENCIAS_TECNICAS: number | null; // Referencia al catálogo de competencias técnicas.
	CODIGO_COMPETENCIAS_TECNICAS?: string; // Código de la competencia (snapshot o catálogo).
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
