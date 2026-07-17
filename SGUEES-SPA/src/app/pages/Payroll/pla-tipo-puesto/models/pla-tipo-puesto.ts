// Modelo del catálogo de tipo de puesto usado en la vista Payroll.
export interface PlaTipoPuesto {
	CORR_EMPRESA: number; // Empresa dueña del registro
	CORR_TIPO_PUESTO: number; // PK del tipo de puesto
	NOMBRE_TIPO_PUESTO: string;
	CODIGO_TIPO_PUESTO: string; // Código único por empresa
	ESTADO_TIPO_PUESTO: boolean; // true=activo, false=inactivo
	USUARIO_CREA: string;
	FECHA_CREA: Date;
	ESTACION_CREA: string;
	USUARIO_ACTU: string;
	FECHA_ACTU: Date;
	ESTACION_ACTU: string;
}
