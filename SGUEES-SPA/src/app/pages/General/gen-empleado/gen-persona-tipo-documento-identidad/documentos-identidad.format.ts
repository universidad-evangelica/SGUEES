// Qué hace: formatos y límites de documentos de identidad (SV) según catálogo.
// Cómo: DUI/NIT con tope+máscara solo si ACTIVO_CARACTERES; NRC siempre guion antes del último dígito.

/** Qué hace: deja solo dígitos. */
export function soloDigitos(valor: string): string {
	return (valor || '').replace(/\D/g, '');
}

/** Qué hace: interpreta ACTIVO_CARACTERES (bit / bool / 0-1). */
export function esActivoCaracteres(activo: unknown): boolean {
	return activo === true || activo === 1 || activo === '1' || activo === 'true';
}

/**
 * Qué hace: DUI — guion antes del último dígito (ej. 8 chars → 1234567-8).
 * Cómo: limita dígitos a maxDigitos y formatea.
 */
export function formatDui(valor: string, maxDigitos: number): string {
	const digits = soloDigitos(valor).substring(0, Math.max(0, maxDigitos));
	if (digits.length === 0) {
		return '';
	}
	if (digits.length === 1) {
		return digits;
	}
	return digits.slice(0, -1) + '-' + digits.slice(-1);
}

/**
 * Qué hace: NIT El Salvador 0000-000000-000-0, limitado a maxDigitos del catálogo.
 */
export function formatNit(valor: string, maxDigitos: number): string {
	const digits = soloDigitos(valor).substring(0, Math.max(0, maxDigitos));
	if (digits.length === 0) {
		return '';
	}
	return (
		digits.substring(0, 4) +
		(digits.length > 4 ? '-' + digits.substring(4, 10) : '') +
		(digits.length > 10 ? '-' + digits.substring(10, 13) : '') +
		(digits.length > 13 ? '-' + digits.substring(13, 14) : '')
	);
}

/**
 * Qué hace: NRC — guion antes del último dígito sin importar la longitud.
 * Cómo: igual al format_nrc de referencia; maxDigitos opcional solo si valida caracteres.
 */
export function formatNrc(valor: string, maxDigitos?: number | null): string {
	let digits = soloDigitos(valor);
	if (maxDigitos != null && Number(maxDigitos) > 0) {
		digits = digits.substring(0, Number(maxDigitos));
	}
	if (digits.length <= 1) {
		return digits;
	}
	return digits.slice(0, -1) + '-' + digits.slice(-1);
}

/**
 * Qué hace: aplica formato según NOMBRE_CORTO respetando tope de dígitos.
 */
export function formatDocumentoIdentidad(nombreCorto: string, valor: string, maxDigitos: number): string {
	const key = (nombreCorto || '').trim().toUpperCase();
	if (key === 'DUI') {
		return formatDui(valor, maxDigitos);
	}
	if (key === 'NIT') {
		return formatNit(valor, maxDigitos);
	}
	if (key === 'NRC') {
		return formatNrc(valor, maxDigitos);
	}
	return (valor || '').substring(0, Math.max(0, maxDigitos));
}

/**
 * Qué hace: longitud máxima del TextBox (dígitos catálogo + guiones).
 * Cómo: null si ACTIVO_CARACTERES inactivo o NUMERO_CARACTERES <= 0 (NRC libre).
 */
export function maxLengthDocumentoIdentidad(
	nombreCorto: string,
	activoCaracteres: unknown,
	numeroCaracteres: number
): number | null {
	if (!esActivoCaracteres(activoCaracteres) || Number(numeroCaracteres) <= 0) {
		return null;
	}
	const n = Number(numeroCaracteres);
	const key = (nombreCorto || '').trim().toUpperCase();
	if (key === 'DUI' || key === 'NIT' || key === 'NRC') {
		const muestra = formatDocumentoIdentidad(nombreCorto, '0'.repeat(n), n);
		return muestra.length || n;
	}
	return n;
}

/**
 * Qué hace: formatea al escribir según tipo y catálogo.
 * Cómo:
 * - NRC: siempre guion antes del último dígito (sin tope si Valida caracteres inactivo).
 * - DUI/NIT/otros: tope + máscara solo si ACTIVO_CARACTERES.
 */
export function aplicarLimiteDocumentoIdentidad(
	nombreCorto: string,
	valor: string,
	activoCaracteres: unknown,
	numeroCaracteres: number
): string {
	const key = (nombreCorto || '').trim().toUpperCase();
	const valida = esActivoCaracteres(activoCaracteres) && Number(numeroCaracteres) > 0;
	const n = Number(numeroCaracteres);

	// NRC: máscara siempre; límite solo si el catálogo valida caracteres.
	if (key === 'NRC') {
		return formatNrc(valor, valida ? n : null);
	}

	if (!valida) {
		return valor ?? '';
	}

	if (key === 'DUI' || key === 'NIT') {
		return formatDocumentoIdentidad(nombreCorto, valor, n);
	}

	return (valor || '').substring(0, n);
}
