export interface GenProveedorUsuario {
	CORR_EMPRESA?: number;
	CORR_PROVEEDOR: number;
	LOGIN_SISTEMA: string;
	NOMBRE_USUARIO: string;
	CORREO_ELECTRONICO: string;
	ESTADO_USUARIO: number;
}

export function emptyGenProveedorUsuario(corrProveedor = 0): GenProveedorUsuario {
	return {
		CORR_PROVEEDOR: corrProveedor,
		LOGIN_SISTEMA: '',
		NOMBRE_USUARIO: '',
		CORREO_ELECTRONICO: '',
		ESTADO_USUARIO: 1,
	};
}
