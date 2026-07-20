// Qué hace: modelo TypeScript de disponibilidad de horario.
// Cómo: define los campos del formulario y la grilla, incluidos los de auditoría.
export interface ScDisponibilidadHorario {
	CORR_EMPRESA: number;
	CORR_DISPONIBILIDAD_HORARIO: number;
	NOMBRE_DISPONIBILIDAD_HORARIO: string;
	// Indica si la disponibilidad de horario está activa (true) o inactiva (false).
	ESTADO_DISPONIBILIDAD_HORARIO: boolean;
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
}
