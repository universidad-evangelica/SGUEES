// Qué hace: modelo TypeScript de puesto (PLA_PUESTO).
// Cómo: define los campos del formulario y la grilla, incluidos lookups y auditoría.
export interface PlaPuesto {
	CORR_EMPRESA: number;
	CORR_PUESTO: number;
	NOMBRE_PUESTO: string;
	CORR_GERENCIA: number | null;
	NOMBRE_GERENCIA?: string | null;
	CORR_UNIDAD?: number | null;
	NOMBRE_UNIDAD?: string | null;
	CORR_NIVEL_ACADEMICO: number | null;
	NOMBRE_NIVEL_ACADEMICO?: string | null;
	CORR_TIPO_PUESTO: number | null;
	NOMBRE_TIPO_PUESTO?: string | null;
	ESTADO_PUESTO: boolean;
	APROBACION_PUESTO: boolean;
	SALARIO_INICIAL: number | null;
	SALARIO_FINAL: number | null;
	USUARIO_VALIDA: string;
	USUARIO_AUTORIZA: string;
	MISION_PUESTO: string;
	OTROS_ASPECTOS: string;
	CODIGO_PUESTO: string;
	CODIGO_FORMATO: string;
	VERSION_FORMATO: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
