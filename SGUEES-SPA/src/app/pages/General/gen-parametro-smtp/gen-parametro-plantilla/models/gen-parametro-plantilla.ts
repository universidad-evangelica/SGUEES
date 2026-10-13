// Qué hace: modelo TypeScript de plantillas de correo asociadas a parámetros SMTP.
// Cómo lo hace: define las propiedades de plantilla HTML, metadatos y auditoría para consumo en el SPA.
export interface GenParametroPlantilla {
	CORR_EMPRESA: number;
	CORR_PARAMETRO_PLANTILLA: number;
	CODIGO_PLANTILLA: string;
	NOMBRE_PLANTILLA: string;
	ASUNTO_PLANTILLA: string;
	CUERPO_PLANTILLA: string;
	CORR_PARAMETRO_SMTP?: number | null;
	CORREO_CC: string;
	CORREO_CCO: string;
	ACTIVO_PLANTILLA: boolean;
	CORREO_REMITENTE?: string | null;
	USUARIO_REMITENTE?: string | null;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date;
}
