export interface ComOrdenCompraDeta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	CORR_ORDEN_COMPRA: number;
	CORR_ORDEN_COMPRA_DETA: number;
	NUMERO_ORDEN_COMPRA?: number | null;
	FECHA_ORDEN_COMPRA?: Date | null;
	CODIGO_ITEM: string;
	NOMBRE_ITEM?: string;
	CORR_UNIDAD_MEDIDA?: number | null;
	NOMBRE_UNIDAD_MEDIDA?: string;
	CANTIDAD: number;
	PRECIO_UNITARIO: number;
	MONTO_SUBTOTAL: number;
	ANIO_PERIODO_COTIZACION?: number | null;
	CORR_COTIZACION?: number | null;
	CORR_COTIZACION_DETA?: number | null;
	CORR_CENTRO_COSTO?: number | null;
	CANTIDAD_RECIBIDA?: number | null;
}
