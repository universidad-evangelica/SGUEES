// Qué hace: modelo TypeScript de tipo contribuyente.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenTipoContribuyente {
	CORR_TIPO_CONTRIBUYENTE: number;
	NOMBRE_TIPO_CONTRIBUYENTE: string;
	ACTIVO_TIPO_CONTRIBUYENTE: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
