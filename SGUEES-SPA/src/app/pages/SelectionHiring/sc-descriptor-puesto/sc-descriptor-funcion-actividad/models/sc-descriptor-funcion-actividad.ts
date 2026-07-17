// Actividad vinculada a una función clave (llave compuesta descriptor + función + actividad).
export interface ScDescriptorFuncionActividad {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_FUNCION: number;
	CORR_ACTIVIDAD: number;
	NOMBRE_ACTIVIDAD: string;
	_marcadaEliminar?: boolean;
	_clientKey?: string | number;
}
