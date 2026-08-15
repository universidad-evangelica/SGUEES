// Requerimiento organizacional asignado al descriptor de puesto.
export interface ScDescriptorPuestoRequerimientoOrganizacional {
	CORR_EMPRESA?: number; // Empresa del registro.
	DESCRIPCION: string; // Texto del requerimiento (snapshot o catálogo).
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el requerimiento.
	CORR_REQUERIMIENTO_ORGANIZACIONAL: number | null; // Referencia al catálogo (parte de la llave natural).
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
