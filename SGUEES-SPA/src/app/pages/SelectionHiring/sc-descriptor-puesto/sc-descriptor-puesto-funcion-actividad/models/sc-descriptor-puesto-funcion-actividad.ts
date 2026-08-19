// Actividad asociada a una función clave o secundaria del descriptor.
export interface ScDescriptorPuestoFuncionActividad {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece la actividad.
	CORR_FUNCION: number; // Función padre a la que pertenece la actividad.
	CORR_ACTIVIDAD: number; // Identificador de la actividad en base de datos.
	NOMBRE_ACTIVIDAD: string; // Descripción de la actividad.
	_marcadaEliminar?: boolean; // Marca interna para eliminar la actividad al guardar.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
