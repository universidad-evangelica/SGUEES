// Qué hace: modelo TypeScript de tipo de institución.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenTipoInstitucion {
	CORR_TIPO_INSTITUCION: number;
	NOMBRE: string;
	ACTIVO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
