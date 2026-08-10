// Relación laboral interna o externa del descriptor de puesto.
export interface ScDescriptorPuestoRelacionLaboral {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece la relación.
	CORR_RELACION_LABORAL: number; // Identificador de la relación en base de datos.
	TIPO_RELACION: string; // Tipo: I (interna) o E (externa).
	PUESTO_AREA: string; // Puesto o área con la que se relaciona el titular.
	MOTIVO_RELACION?: string | null; // Motivo o propósito de la relación laboral.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
