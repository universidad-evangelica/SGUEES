// Qué hace: modelos TypeScript de ACA_SE_SECCION y lookup de versión.
// Cómo lo hace: refleja V_ACA_SE_SECCION y el GetLookUp de ACA_SE_VERSION.
export interface AcaSeSeccion {
	CORR_SECCION_SE: number;
	CORR_VERSION: number;
	CODIGO_VERSION?: string;
	NOMBRE_VERSION?: string;
	NOMBRE_SECCION: string;
	DESCRIPCION?: string | null;
	ORDEN: number;
	PUNTAJE_MAXIMO?: number | null;
	PORCENTAJE_SECCION?: number | null;
	ACTIVO: boolean;
	CORR_EMPRESA?: number;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}

export interface AcaSeVersionLookup {
	CORR_VERSION: number;
	CODIGO: string;
	NOMBRE: string;
	ACTIVO?: boolean;
}
