// Perfil padre del descriptor (edad, sexo, modalidad, etc.).
export interface ScDescriptorPerfilPuesto {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_PERFIL_PUESTO?: number;
	EDAD_MINIMA?: number | null;
	EDAD_MAXIMA?: number | null;
	SEXO?: string | null;
	ESTADO_FAMILIAR?: string | null;
	CORR_DISPONIBILIDAD_HORARIO?: number | null;
	NOMBRE_DISPONIBILIDAD_HORARIO?: string | null;
	CORR_TIPO_MODALIDAD?: number | null;
	NOMBRE_MODALIDAD?: string | null;
	LICENCIA?: boolean | null;
}

// Lookup de disponibilidad horaria.
export interface ScDisponibilidadHorarioLookup {
	CORR_DISPONIBILIDAD_HORARIO: number;
	// Texto del valor cerrado (puede ser snapshot del perfil).
	NOMBRE_DISPONIBILIDAD_HORARIO: string;
	// Texto del catálogo para el popup del select.
	NOMBRE_DISPONIBILIDAD_HORARIO_CATALOGO?: string;
}

// Lookup de tipo de modalidad.
export interface ScTipoModalidadLookup {
	CORR_TIPO_MODALIDAD: number;
	// Texto del valor cerrado (puede ser snapshot del perfil).
	MODALIDAD_NOMBRE: string;
	// Texto del catálogo para el popup del select.
	MODALIDAD_NOMBRE_CATALOGO?: string;
}

// Opciones de listas fijas del perfil (sexo, estado familiar, licencia).
export interface PerfilListaOption<T = string | boolean> {
	CODIGO: T;
	NOMBRE: string;
}
