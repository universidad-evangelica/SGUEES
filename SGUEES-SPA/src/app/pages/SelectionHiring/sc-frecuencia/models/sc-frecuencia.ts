// Qué hace: modelo TypeScript de frecuencia.
// Cómo: define los campos del formulario y la grilla, incluidos los de auditoría.
export interface ScFrecuencia {
	CORR_EMPRESA: number;
	CORR_FRECUENCIA: number;
	NOMBRE_FRECUENCIA: string;
	// Indica si la frecuencia está activa (true) o inactiva (false).
	ESTADO_FRECUENCIA: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
