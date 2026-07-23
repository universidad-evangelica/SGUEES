// Requerimiento organizacional asignado al descriptor de puesto.
export interface ScDescriptorPuestoRequerimientoOrganizacional {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL: number; // Identificador del detalle en base de datos.
	DESCRIPCION: string; // Texto del requerimiento (snapshot o catálogo).
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece el requerimiento.
	CORR_REQUERIMIENTO_ORGANIZACIONAL: number | null; // Referencia al catálogo de requerimientos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
