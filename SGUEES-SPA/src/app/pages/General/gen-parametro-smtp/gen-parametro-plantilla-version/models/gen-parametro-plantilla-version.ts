// Qué hace: modelo TypeScript para las versiones de una plantilla de correo.
// Cómo lo hace: define las propiedades que representan cada versión registrada en GEN_PARAMETRO_PLANTILLA_VERSION.
export interface GenParametroPlantillaVersion {
	CORR_EMPRESA: number;
	CORR_PARAMETRO_PLANTILLA: number;
	CODIGO_PLANTILLA?: string;
	NOMBRE_PLANTILLA?: string;
	NUMERO_VERSION: number;
	ASUNTO_PLANTILLA: string;
	CUERPO_PLANTILLA: string;
	CORREO_CC?: string | null;
	CORREO_CCO?: string | null;
	ES_VERSION_ACTIVA: boolean;
	MOTIVO_VERSION?: string | null;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date;
}
