export interface ComCuadroComparativoOrdenCompra {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_CUADRO_COMPARATIVO: number;
	NUMERO_ORDEN: number;
	CORR_ORDEN_COMPRA?: number | null;
	CORR_PROVEEDOR: number;
	NOMBRE_PROVEEDOR: string;
	MONTO_TOTAL_ORDEN: number;
	ESTADO_ORDEN_COMPRA?: string;
	NOMBRE_ESTADO_ORDEN_COMPRA?: string;
	FECHA_ORDEN_COMPRA?: Date | null;
	NUMERO_ORDEN_COMPRA?: number | null;
	NOMBRE_CONDICION_PAGO?: string;
	NOMBRE_FORMA_PAGO?: string;
	DETALLE_FORMA_PAGO?: string;
}
