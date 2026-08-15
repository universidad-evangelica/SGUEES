// Responsabilidad del cargo; puede incluir fila virtual de impacto económico.
export interface ScDescriptorPuestoResponsabilidadCargo {
	CORR_EMPRESA?: number; // Empresa del registro.
	NOMBRE_RESPONSABILIDAD: string; // Nombre de la responsabilidad (snapshot o catálogo).
	INFORMACION?: string | null; // Información adicional sobre la responsabilidad.
	APLICA_DESCRIPTOR?: string; // Indica si aplica al descriptor (S/N).
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece la responsabilidad.
	CORR_RESPONSABILIDAD: number | null; // Referencia al catálogo (parte de la llave natural).
	CORR_IMPACTO_ECONOMICO?: number | null; // Impacto económico asociado (solo fila virtual).
	_esImpactoEconomico?: boolean; // Marca interna: true si es la fila fija de impacto económico.
	_esNuevo?: boolean; // true si la fila aun no se ha guardado en base de datos.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}

// Llave fija de la fila virtual de impacto económico en el grid de responsabilidades.
export const IMPACTO_ECONOMICO_CLIENT_KEY = 'impacto-economico-fijo';
// Nombre mostrado en la fila fija de impacto económico institucional.
export const IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR = 'Impacto Económico Institucional';
