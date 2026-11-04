// Qué hace: modelo TypeScript de tipo de pregunta SE.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenSeTipoPregunta {
	CORR_TIPO_PREGUNTA: number;
	CODIGO: string;
	NOMBRE: string;
	ACTIVO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
