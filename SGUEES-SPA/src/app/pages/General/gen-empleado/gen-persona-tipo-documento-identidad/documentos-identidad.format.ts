// Qué hace: formatos y límites de documentos de identidad (SV) según catálogo.
// Cómo: DUI/NIT/NRC solo dígitos + guiones; tope de dígitos si ACTIVO_CARACTERES.

/** Qué hace: deja solo dígitos. */
export function soloDigitos(valor: string): string {
	return (valor || '').replace(/\D/g, '');
}

/** Qué hace: interpreta ACTIVO_CARACTERES (bit / bool / 0-1). */
export function esActivoCaracteres(activo: unknown): boolean {
	return activo === true || activo === 1 || activo === '1' || activo === 'true';
}

/**
 * Qué hace: normaliza la clave del tipo (DUI/NIT/NRC) desde corto o nombre largo.
 * Cómo: prioriza NOMBRE_CORTO; si no, busca DUI|NIT|NRC en el nombre del catálogo.
 */
export function claveTipoDocumento(nombreCorto?: string, nombreLargo?: string): string {
	const corto = `${nombreCorto || ''}`.trim().toUpperCase();
	if (corto === 'DUI' || corto === 'NIT' || corto === 'NRC') {
		return corto;
	}
	const largo = `${nombreLargo || ''}`.trim().toUpperCase();
	if (largo === 'DUI' || largo === 'NIT' || largo === 'NRC') {
		return largo;
	}
	if (/\bDUI\b/.test(largo)) {
		return 'DUI';
	}
	if (/\bNIT\b/.test(largo)) {
		return 'NIT';
	}
	if (/\bNRC\b/.test(largo)) {
		return 'NRC';
	}
	return corto || largo;
}

/** Qué hace: indica si el documento solo admite dígitos (DUI/NIT/NRC). */
export function esDocumentoSoloDigitos(nombreCorto?: string, nombreLargo?: string): boolean {
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	return key === 'DUI' || key === 'NIT' || key === 'NRC';
}

/**
 * Qué hace: DUI — solo dígitos; guion antes del último (ej. 1234567-8).
 * Cómo: maxDigitos opcional; si viene del catálogo, recorta a ese tope.
 */
export function formatDui(valor: string, maxDigitos?: number | null): string {
	let digits = soloDigitos(valor);
	if (maxDigitos != null && Number(maxDigitos) > 0) {
		digits = digits.substring(0, Number(maxDigitos));
	}
	if (digits.length === 0) {
		return '';
	}
	if (digits.length === 1) {
		return digits;
	}
	return digits.slice(0, -1) + '-' + digits.slice(-1);
}

/**
 * Qué hace: NIT solo dígitos; máscara 0000-000000-000-… según maxDigitos del catálogo.
 * Cómo: grupos 4-6-3 y el resto en el último bloque (si catálogo >14, no corta en 14).
 */
export function formatNit(valor: string, maxDigitos?: number | null): string {
	let digits = soloDigitos(valor);
	if (maxDigitos != null && Number(maxDigitos) > 0) {
		digits = digits.substring(0, Number(maxDigitos));
	}
	if (digits.length === 0) {
		return '';
	}
	return (
		digits.substring(0, 4) +
		(digits.length > 4 ? '-' + digits.substring(4, 10) : '') +
		(digits.length > 10 ? '-' + digits.substring(10, 13) : '') +
		(digits.length > 13 ? '-' + digits.substring(13) : '')
	);
}

/**
 * Qué hace: NRC — solo dígitos; guion antes del último dígito.
 * Cómo: maxDigitos opcional solo si el catálogo valida caracteres.
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
export function formatDocumentoIdentidad(
	nombreCorto: string,
	valor: string,
	maxDigitos: number,
	nombreLargo?: string
): string {
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
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
 * Cómo: null si ACTIVO_CARACTERES inactivo o NUMERO_CARACTERES <= 0.
 */
export function maxLengthDocumentoIdentidad(
	nombreCorto: string,
	activoCaracteres: unknown,
	numeroCaracteres: number,
	nombreLargo?: string
): number | null {
	if (!esActivoCaracteres(activoCaracteres) || Number(numeroCaracteres) <= 0) {
		return null;
	}
	const n = Number(numeroCaracteres);
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	if (key === 'DUI' || key === 'NIT' || key === 'NRC') {
		const muestra = formatDocumentoIdentidad(nombreCorto, '0'.repeat(n), n, nombreLargo);
		return muestra.length || n;
	}
	return n;
}

/**
 * Qué hace: formatea al escribir según tipo y catálogo.
 * Cómo:
 * - DUI/NIT/NRC: nunca letras (solo dígitos + guiones automáticos).
 * - Tope de dígitos solo si ACTIVO_CARACTERES + NUMERO_CARACTERES > 0.
 */
export function aplicarLimiteDocumentoIdentidad(
	nombreCorto: string,
	valor: string,
	activoCaracteres: unknown,
	numeroCaracteres: number,
	nombreLargo?: string
): string {
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	const valida = esActivoCaracteres(activoCaracteres) && Number(numeroCaracteres) > 0;
	const n = Number(numeroCaracteres);
	const tope = valida ? n : null;

	if (key === 'DUI') {
		return formatDui(valor, tope);
	}
	if (key === 'NIT') {
		return formatNit(valor, tope);
	}
	if (key === 'NRC') {
		return formatNrc(valor, tope);
	}

	if (!valida) {
		return valor ?? '';
	}

	return (valor || '').substring(0, n);
}
