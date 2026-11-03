// Qué hace: modelo TypeScript de ACA_SE_BANDA.
// Cómo lo hace: refleja columnas de V_ACA_SE_BANDA (sin auditoría de actualización).
export interface AcaSeBanda {
	CORR_BANDA: number;
	CODIGO_REGLA: string;
	VALOR_DESDE: number;
	VALOR_HASTA: number;
	PUNTAJE: number;
	ACTIVO: boolean;
	CORR_EMPRESA?: number;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
}
