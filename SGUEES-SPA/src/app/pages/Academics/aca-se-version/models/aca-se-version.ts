// Qué hace: modelo TypeScript de ACA_SE_VERSION.
// Cómo lo hace: refleja columnas de V_ACA_SE_VERSION para el mantenimiento.
export interface AcaSeVersion {
	CORR_VERSION: number;
	CODIGO: string;
	NOMBRE: string;
	DESCRIPCION: string;
	ACTIVO: boolean;
	FECHA_VIGENCIA_INI: Date | string | null;
	FECHA_VIGENCIA_FIN: Date | string | null;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}
