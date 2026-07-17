// Modelo TypeScript de responsabilidad del cargo (campos del formulario y grilla).
export interface ScResponsabilidadCargo {
	CORR_EMPRESA: number;
	CORR_RESPONSABILIDAD: number;
	NOMBRE_RESPONSABILIDAD: string;
	ESTADO_RESPONSABILIDAD: boolean;
	APLICA_DESCRIPTOR: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
