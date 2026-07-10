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
	MODALIDAD_NOMBRE?: string | null;
	LICENCIA?: boolean | null;
}

export interface ScDisponibilidadHorarioLookup {
	CORR_DISPONIBILIDAD_HORARIO: number;
	NOMBRE_DISPONIBILIDAD_HORARIO: string;
}

export interface ScTipoModalidadLookup {
	CORR_TIPO_MODALIDAD: number;
	MODALIDAD_NOMBRE: string;
}

export interface PerfilListaOption<T = string | boolean> {
	CODIGO: T;
	NOMBRE: string;
}
