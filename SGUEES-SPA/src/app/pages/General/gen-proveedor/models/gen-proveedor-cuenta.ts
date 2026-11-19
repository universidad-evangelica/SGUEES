export interface GenProveedorCuenta {
	CORR_EMPRESA?: number;
	CORR_PROVEEDOR: number;
	CORR_CUENTA: number;
	TIPO_CUENTA: string;
	CUENTA_CONTABLE: string;
	NOMBRE_CUENTA?: string;
	ACTIVO: boolean;
}

export function emptyGenProveedorCuenta(corrProveedor = 0): GenProveedorCuenta {
	return {
		CORR_PROVEEDOR: corrProveedor,
		CORR_CUENTA: 0,
		TIPO_CUENTA: '',
		CUENTA_CONTABLE: '',
		NOMBRE_CUENTA: '',
		ACTIVO: true,
	};
}

export function cuentaEstaActiva(valor: unknown): boolean {
	return valor === true || valor === 1 || valor === '1' || valor === 'true';
}
