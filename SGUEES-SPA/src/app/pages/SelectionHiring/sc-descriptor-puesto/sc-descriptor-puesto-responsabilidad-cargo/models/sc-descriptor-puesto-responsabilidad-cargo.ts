// Responsabilidad de cargo del descriptor. La fila virtual de impacto económico usa
// IMPACTO_ECONOMICO_CLIENT_KEY y `_esImpactoEconomico` para reglas de edición distintas.
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

export const IMPACTO_ECONOMICO_CLIENT_KEY = 'impacto-economico-fijo';
export const IMPACTO_ECONOMICO_NOMBRE_DESCRIPTOR = 'Impacto Económico Institucional';
