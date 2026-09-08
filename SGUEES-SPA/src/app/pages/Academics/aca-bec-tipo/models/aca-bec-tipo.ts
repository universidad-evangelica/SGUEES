export interface AcaBecTipo {
	CORR_EMPRESA?: number;
	CORR_BECA: number;
	CODIGO_BECA: string;
	NOMBRE_BECA: string;
	CORR_ORIGEN_BECA: number;
	CODIGO_ORIGEN?: string;
	NOMBRE_ORIGEN?: string;
	CORR_CONVENIO?: number | null;
	CODIGO_CONVENIO?: string | null;
	NOMBRE_CONVENIO?: string | null;
	ARTICULO_REGLAMENTO?: string | null;
	PORCENTAJE_COBERTURA_REFERENCIAL?: number | null;
	CUM_MINIMO_RENOVACION?: number | null;
	APLICA_NUEVO_INGRESO: boolean;
	APLICA_ANTIGUO_INGRESO: boolean;
	APLICA_EMPLEADO: boolean;
	APLICA_HIJO_EMPLEADO: boolean;
	NIVEL_ACADEMICO_APLICA: string;
	REQUIERE_CONVENIO: boolean;
	REQUIERE_ESTUDIO_SOCIOECONOMICO: boolean;
	REQUIERE_APROBACION_COMITE: boolean;
	REQUIERE_APROBACION_DIRECTORIO: boolean;
	UNIDAD_RESPONSABLE?: string | null;
	DESCRIPCION?: string | null;
	ESTADO_BECA: string;
	ACTIVO?: boolean;
	CANT_REQUISITOS?: number;
	CANT_DOCUMENTOS?: number;
	CANT_FINANCIADORES?: number;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}

export interface AcaBecOrigenBecaLookup {
	CORR_ORIGEN_BECA: number;
	CODIGO_ORIGEN: string;
	NOMBRE_ORIGEN: string;
	ACTIVO?: boolean;
}

export interface AcaBecConvenioLookup {
	CORR_CONVENIO: number;
	CODIGO_CONVENIO: string;
	NOMBRE_CONVENIO: string;
	NOMBRE_ENTIDAD?: string;
	ESTADO_CONVENIO?: string;
}
