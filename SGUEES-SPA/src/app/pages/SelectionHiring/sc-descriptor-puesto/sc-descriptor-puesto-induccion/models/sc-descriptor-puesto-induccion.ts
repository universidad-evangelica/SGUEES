// Inducción asignada al descriptor de puesto (formato entrenamiento).
export interface ScDescriptorPuestoInduccion {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece la inducción.
	CORR_INDUCCION: number | null; // Referencia al catálogo de inducciones (parte de la llave natural).
	NOMBRE_INDUCCION: string; // Nombre de la inducción (snapshot del catálogo).
	TIEMPO_INDUCCION: string | null; // Duración unida (ej. "2 Semanas") snapshot del catálogo.
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
