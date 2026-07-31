// Inducción asignada al descriptor de puesto (formato entrenamiento).
export interface ScDescriptorPuestoInduccion {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece la inducción.
	CORR_INDUCCION: number | null; // Referencia al catálogo de inducciones (parte de la llave natural).
	NOMBRE_INDUCCION: string; // Nombre de la inducción (snapshot del catálogo) o "Responsable" en fila fija.
	TIEMPO_INDUCCION: string | null; // Información: duración unida (ej. "2 Semanas") o texto del responsable.
	_esResponsableEntrenamiento?: boolean; // Marca interna: true si es la fila fija de responsable.
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}

// Llave fija de la fila virtual de responsable en el grid de entrenamiento.
export const RESPONSABLE_ENTRENAMIENTO_CLIENT_KEY = 'responsable-entrenamiento-fijo';
// Nombre mostrado en la fila fija de responsable del entrenamiento.
export const RESPONSABLE_ENTRENAMIENTO_NOMBRE = 'Responsable';
