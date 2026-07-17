// Responsabilidad del cargo; puede ser fila virtual de impacto economico.
export interface ScDescriptorPuestoResponsabilidadCargo {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_RESPONSABILIDAD: number;
	NOMBRE_RESPONSABILIDAD: string;
	INFORMACION?: string | null;
	APLICA_DESCRIPTOR?: string;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_RESPONSABILIDAD: number | null;
	CORR_IMPACTO_ECONOMICO?: number | null;
	_esImpactoEconomico?: boolean;
	_clientKey?: string | number;
}

// Llaves fijas de la fila virtual de impacto economico en el grid.
export const IMPACTO_ECONOMICO_CLIENT_KEY = 'impacto-economico-fijo';
export const IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR = 'Impacto Económico Institucional';
