// Qué hace: modelo TypeScript de Tipo Contacto.
// Cómo lo hace: define campos de formulario/grilla y auditoría.
export interface GenTipoContacto {
	CORR_TIPO_CONTACTO: number;
	NOMBRE_TIPO_CONTACTO: string;
	NOMBRE_CORTO: string;
	ACTIVO_TIPO_CONTACTO: boolean;
	NUMERO_CARACTERES: number;
	ACTIVO_CARACTERES: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

