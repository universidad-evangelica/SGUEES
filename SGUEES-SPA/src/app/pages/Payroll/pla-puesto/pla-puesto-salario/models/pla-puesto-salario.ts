// Qué hace: modelo de salario del puesto en una unidad.
// Cómo lo hace: refleja V_PLA_PUESTO_SALARIO.
export interface PlaPuestoSalario {
	CORR_EMPRESA: number;
	CORR_PUESTO_SALARIO: number;
	CORR_PUESTO: number;
	CORR_UNIDAD: number | null;
	CODIGO_UNIDAD?: string;
	NOMBRE_UNIDAD?: string;
	FILA_KEY?: string;
	SALARIO_INICIAL: number | null;
	SALARIO_FINAL: number | null;
	FECHA_INGRESO: string | null;
	FECHA_FINALIZACION?: string | null;
	ACTIVO_PUESTO_SALARIO: boolean;
}
