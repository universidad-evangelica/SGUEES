export interface ComProvision {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_PROVISION: number;
	FECHA_PROVISION: Date;
	NOMBRE_PROVEEDOR: string;
	NOMBRE_PARTIDA: string;
	MONTO_PAGO: number;
	ANIO_PERIODO_PARTIDA?: number | null;
	MES_PERIODO_PARTIDA?: number | null;
	CORR_CLASE_PARTIDA?: number | null;
	NOMBRE_CLASE_PARTIDA?: string;
	CORR_PARTIDA?: number | null;
	ESTADO_PROVISION: string;
	NOMBRE_ESTADO_PROVISION: string;
	SELECCION?: boolean;
}
