// Qué hace: modelos TypeScript de ACA_SE_RANGO_MONTO y lookups.
// Cómo lo hace: refleja V_ACA_SE_RANGO_MONTO y GetLookUp de versión/sección RANGO_MONTO.
export interface AcaSeRangoMonto {
	CORR_RANGO_MONTO: number;
	CORR_VERSION: number;
	CODIGO_VERSION?: string;
	NOMBRE_VERSION?: string;
	CORR_SECCION_SE: number;
	CODIGO_SECCION?: string;
	NOMBRE_SECCION?: string;
	TIPO_EVALUACION?: string;
	DESCRIPCION: string;
	PUNTAJE: number;
	RANGO_INICIAL: number;
	RANGO_FINAL: number;
	ORDEN: number;
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

export interface AcaSeSeccionRangoLookup {
	CORR_SECCION_SE: number;
	CORR_VERSION: number;
	CODIGO: string;
	NOMBRE_SECCION: string;
	TIPO_EVALUACION?: string;
	PORCENTAJE_MAXIMO?: number;
	ACTIVO?: boolean;
}
