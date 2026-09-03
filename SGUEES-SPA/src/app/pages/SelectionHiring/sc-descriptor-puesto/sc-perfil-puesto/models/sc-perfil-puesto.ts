// Perfil padre del descriptor (edad, sexo, modalidad, licencia, etc.).
export interface ScPerfilPuesto {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el perfil.
	CORR_PERFIL_PUESTO?: number; // Identificador del perfil en base de datos.
	EDAD_MINIMA?: number | null; // Edad mínima requerida para el puesto.
	EDAD_MAXIMA?: number | null; // Edad máxima requerida para el puesto.
	SEXO?: string | null; // Sexo requerido o INDIFERENTE.
	ESTADO_FAMILIAR?: string | null; // Estado familiar requerido o INDIFERENTE.
	CORR_DISPONIBILIDAD_HORARIO?: number | null; // Catálogo de disponibilidad horaria.
	NOMBRE_DISPONIBILIDAD_HORARIO?: string | null; // Nombre de la disponibilidad (snapshot o catálogo).
	CORR_TIPO_MODALIDAD?: number | null; // Catálogo de modalidad de trabajo.
	NOMBRE_MODALIDAD?: string | null; // Nombre de la modalidad (snapshot o catálogo).
	LICENCIA?: boolean | null; // Indica si se requiere licencia de conducir.
	OTROS?: string | null; // Texto libre adicional (visible solo en formato corto/ambos).
}

// Lookup de disponibilidad horaria para el select del perfil.
export interface ScDisponibilidadHorarioLookup {
	CORR_DISPONIBILIDAD_HORARIO: number; // Identificador de la disponibilidad.
	// Texto del valor cerrado (puede ser snapshot del perfil).
	NOMBRE_DISPONIBILIDAD_HORARIO: string;
	// Texto del catálogo para el popup del select.
	NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO?: string;
}

// Lookup de tipo de modalidad de trabajo (presencial, híbrido, etc.).
export interface ScTipoModalidadLookup {
	CORR_TIPO_MODALIDAD: number; // Identificador de la modalidad.
	// Texto del valor cerrado (puede ser snapshot del perfil).
	MODALIDAD_NOMBRE: string;
	// Texto del catálogo para el popup del select.
	MODALIDAD_NOMBRE_CATALOGO?: string;
}

// Opciones de listas fijas del perfil (sexo, estado familiar, licencia).
export interface PerfilListaOption<T = string | boolean> {
	CODIGO: T; // Valor interno de la opción.
	NOMBRE: string; // Texto visible para el usuario.
}
