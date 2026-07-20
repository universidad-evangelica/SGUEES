export interface BanConciliaBancaria {
	CORR_EMPRESA: number;
	CORR_CUENTA_BANCO: number;
	NUMERO_CUENTA_BANCO?: string;
	NOMBRE_CUENTA_BANCO?: string;
	NOMBRE_TIPO_CUENTA_BANCO?: string;
	CUENTA_CONTABLE?: string;
	CORR_CONCILIACION: number;
	FECHA_CONCILIACION: Date | string;
	SALDO_CUENTA_CONTA?: number;
	SALDO_CUENTA_BANCO?: number;
	MONTO_AUMENTA?: number;
	MONTO_DISMINUYE?: number;
	SEGUN_LIBROS?: number;
	ESTADO_CONCILIACION: string;
	NOMBRE_ESTADO_CONCILIACION?: string;
}

export interface BanConciliaBancariaPendiente {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_CLASE_PARTIDA: number;
	CORR_PARTIDA: number;
	NUMERO_DOCUMENTO: string;
	FECHA_PARTIDA: Date | string;
	NOMBRE_CLASE_PARTIDA: string;
	ESTADO_PARTIDA: string;
	CORR_PARTIDA_DETA: number;
	CUENTA_CONTABLE: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
	MONTO_CARGO_FORANEA?: number;
	MONTO_ABONO_FORANEA?: number;
	NOMBRE_TRAN: string;
	ESTA_CONCILIA: boolean;
}

export interface BanConciliaBancariaResumen {
	CORR_EMPRESA: number;
	CORR_CUENTA_BANCO: number;
	CORR_CONCILIACION: number;
	CORR_LINEA: number;
	NOMBRE_LINEA_TRABAJO: string;
	AUMENTA_DISMINUYE: number;
	MONTO: number;
	TIPO_RESUMEN?: string;
}

export interface BanConciliaBancariaMovi {
	CORR_EMPRESA: number;
	CORR_CUENTA_BANCO: number;
	CORR_CONCILIACION: number;
	CORR_MOVIMIENTO: number;
	CORR_LINEA: number;
	NOMBRE_LINEA_TRABAJO: string;
	AUMENTA_DISMINUYE: number;
	ANIO_PERIODO?: number;
	MES_PERIODO?: number;
	CORR_CLASE_PARTIDA?: number;
	CORR_PARTIDA?: number;
	CORR_PARTIDA_DETA?: number;
	NOMBRE_TRAN: string;
	NOMBRE_CLASE_PARTIDA: string;
	NUMERO_DOCUMENTO: string;
	CORR_TIPO_MOVIMIENTO?: number;
	NOMBRE_TIPO_MOVIMIENTO: string;
	CORR_CONCILIACION_DETA?: number;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
	NUMERO_REFERENCIA_BANCO: string;
	FECHA_MOVIMIENTO?: Date | string;
	MONTO: number;
}
