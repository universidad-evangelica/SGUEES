// Qué hace: formatos y límites de documentos de identidad según catálogo.
// Cómo: FORMATO_CARACTERES (NUMEROS/LETRAS/AMBOS); máscara por NOMBRE_CORTO (DUI/ISSS/AFP/NIT/NRC);
//       resto solo filtro de caracteres + tope si ACTIVO_CARACTERES.

export type FormatoCaracteresDoc = 'NUMEROS' | 'LETRAS' | 'AMBOS';

/** Qué hace: deja solo dígitos. */
export function soloDigitos(valor: string): string {
	return (valor || '').replace(/\D/g, '');
}

/** Qué hace: interpreta ACTIVO_CARACTERES (bit / bool / 0-1). */
export function esActivoCaracteres(activo: unknown): boolean {
	return activo === true || activo === 1 || activo === '1' || activo === 'true';
}

/**
 * Qué hace: normaliza FORMATO_CARACTERES del catálogo (CHECK LETRAS/NUMEROS/AMBOS).
 * Cómo: default NUMEROS si vacío (compatibilidad docs numéricos).
 */
export function normalizarFormatoCaracteres(valor?: string | null): FormatoCaracteresDoc {
	const v = `${valor ?? ''}`.trim().toUpperCase();
	if (v === 'LETRAS' || v === 'NUMEROS' || v === 'AMBOS') {
		return v;
	}
	return 'NUMEROS';
}

/**
 * Qué hace: deja solo caracteres permitidos según FORMATO_CARACTERES (sin guiones).
 */
export function filtrarPorFormatoCaracteres(valor: string, formato: FormatoCaracteresDoc): string {
	const raw = valor || '';
	if (formato === 'NUMEROS') {
		return raw.replace(/\D/g, '');
	}
	if (formato === 'LETRAS') {
		return raw.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
	}
	return raw.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/g, '');
}

/** Qué hace: indica si la tecla es válida para el formato (sin guion; la máscara lo pone). */
export function teclaPermitidaPorFormato(key: string, formato: FormatoCaracteresDoc): boolean {
	if (!key || key.length !== 1) {
		return true;
	}
	if (formato === 'NUMEROS') {
		return /[0-9]/.test(key);
	}
	if (formato === 'LETRAS') {
		return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(key);
	}
	return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(key);
}

/**
 * Qué hace: normaliza la clave del tipo (DUI/ISSS/AFP/NIT/NRC) desde corto o nombre largo.
 */
export function claveTipoDocumento(nombreCorto?: string, nombreLargo?: string): string {
	const corto = `${nombreCorto || ''}`.trim().toUpperCase();
	if (corto === 'DUI' || corto === 'ISSS' || corto === 'AFP' || corto === 'NIT' || corto === 'NRC') {
		return corto;
	}
	const largo = `${nombreLargo || ''}`.trim().toUpperCase();
	if (largo === 'DUI' || largo === 'ISSS' || largo === 'AFP' || largo === 'NIT' || largo === 'NRC') {
		return largo;
	}
	if (/\bDUI\b/.test(largo)) {
		return 'DUI';
	}
	if (/\bISSS\b/.test(largo)) {
		return 'ISSS';
	}
	if (/\bAFP\b/.test(largo)) {
		return 'AFP';
	}
	if (/\bNIT\b/.test(largo)) {
		return 'NIT';
	}
	if (/\bNRC\b/.test(largo)) {
		return 'NRC';
	}
	return corto || largo;
}

/** Qué hace: indica si el tipo usa máscara por NOMBRE_CORTO (DUI/ISSS/AFP/NIT/NRC). */
export function esDocumentoConMascara(nombreCorto?: string, nombreLargo?: string): boolean {
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	return key === 'DUI' || key === 'ISSS' || key === 'AFP' || key === 'NIT' || key === 'NRC';
}

/**
 * Qué hace: filtra documentos según APLICA_PARA y si la persona es extranjera.
 * Cómo: extranjero → EXTRANJEROS|AMBOS; nacional → NACIONALES|AMBOS; vacío → AMBOS.
 */
export function documentoVisiblePorAplicaPara(aplicaPara: string | undefined | null, esExtranjero: boolean): boolean {
	const a = `${aplicaPara ?? ''}`.trim().toUpperCase();
	if (!a || a === 'AMBOS') {
		return true;
	}
	if (esExtranjero) {
		return a === 'EXTRANJEROS';
	}
	return a === 'NACIONALES';
}

/**
 * Qué hace: DUI/ISSS/AFP — cuerpo según formato; guion antes del último carácter.
 */
export function formatDui(
	valor: string,
	maxCaracteres?: number | null,
	formato: FormatoCaracteresDoc = 'NUMEROS'
): string {
	let body = filtrarPorFormatoCaracteres(valor, formato);
	if (maxCaracteres != null && Number(maxCaracteres) > 0) {
		body = body.substring(0, Number(maxCaracteres));
	}
	if (body.length === 0) {
		return '';
	}
	if (body.length === 1) {
		return body;
	}
	return body.slice(0, -1) + '-' + body.slice(-1);
}

/**
 * Qué hace: NIT — cuerpo según formato; máscara 0000-000000-000-… según tope catálogo.
 */
export function formatNit(
	valor: string,
	maxCaracteres?: number | null,
	formato: FormatoCaracteresDoc = 'NUMEROS'
): string {
	let body = filtrarPorFormatoCaracteres(valor, formato);
	if (maxCaracteres != null && Number(maxCaracteres) > 0) {
		body = body.substring(0, Number(maxCaracteres));
	}
	if (body.length === 0) {
		return '';
	}
	return (
		body.substring(0, 4) +
		(body.length > 4 ? '-' + body.substring(4, 10) : '') +
		(body.length > 10 ? '-' + body.substring(10, 13) : '') +
		(body.length > 13 ? '-' + body.substring(13) : '')
	);
}

/**
 * Qué hace: NRC — cuerpo según formato; guion antes del último carácter.
 */
export function formatNrc(
	valor: string,
	maxCaracteres?: number | null,
	formato: FormatoCaracteresDoc = 'NUMEROS'
): string {
	let body = filtrarPorFormatoCaracteres(valor, formato);
	if (maxCaracteres != null && Number(maxCaracteres) > 0) {
		body = body.substring(0, Number(maxCaracteres));
	}
	if (body.length <= 1) {
		return body;
	}
	return body.slice(0, -1) + '-' + body.slice(-1);
}

/**
 * Qué hace: aplica máscara DUI/ISSS/AFP/NIT/NRC o solo filtro de caracteres para otros tipos.
 */
export function formatDocumentoIdentidad(
	nombreCorto: string,
	valor: string,
	maxCaracteres: number,
	nombreLargo?: string,
	formatoCaracteres?: string | null
): string {
	const formato = normalizarFormatoCaracteres(formatoCaracteres);
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	if (key === 'DUI' || key === 'ISSS' || key === 'AFP') {
		return formatDui(valor, maxCaracteres, formato);
	}
	if (key === 'NIT') {
		return formatNit(valor, maxCaracteres, formato);
	}
	if (key === 'NRC') {
		return formatNrc(valor, maxCaracteres, formato);
	}
	return filtrarPorFormatoCaracteres(valor, formato).substring(0, Math.max(0, maxCaracteres));
}

/**
 * Qué hace: longitud máxima del TextBox (cuerpo catálogo + guiones de máscara).
 */
export function maxLengthDocumentoIdentidad(
	nombreCorto: string,
	activoCaracteres: unknown,
	numeroCaracteres: number,
	nombreLargo?: string,
	formatoCaracteres?: string | null
): number | null {
	if (!esActivoCaracteres(activoCaracteres) || Number(numeroCaracteres) <= 0) {
		return null;
	}
	const n = Number(numeroCaracteres);
	const formato = normalizarFormatoCaracteres(formatoCaracteres);
	const muestraChar = formato === 'NUMEROS' ? '0' : 'A';
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	if (key === 'DUI' || key === 'ISSS' || key === 'AFP' || key === 'NIT' || key === 'NRC') {
		const muestra = formatDocumentoIdentidad(nombreCorto, muestraChar.repeat(n), n, nombreLargo, formato);
		return muestra.length || n;
	}
	return n;
}

/**
 * Qué hace: formatea al escribir según tipo, FORMATO_CARACTERES y tope del catálogo.
 * Cómo:
 * - DUI/ISSS/AFP/NIT/NRC: máscara por nombre corto + letras/números según FORMATO_CARACTERES.
 * - Otros: solo filtro FORMATO_CARACTERES (+ tope si ACTIVO_CARACTERES).
 */
export function aplicarLimiteDocumentoIdentidad(
	nombreCorto: string,
	valor: string,
	activoCaracteres: unknown,
	numeroCaracteres: number,
	nombreLargo?: string,
	formatoCaracteres?: string | null
): string {
	const formato = normalizarFormatoCaracteres(formatoCaracteres);
	const key = claveTipoDocumento(nombreCorto, nombreLargo);
	const valida = esActivoCaracteres(activoCaracteres) && Number(numeroCaracteres) > 0;
	const n = Number(numeroCaracteres);
	const tope = valida ? n : null;

	if (key === 'DUI' || key === 'ISSS' || key === 'AFP') {
		return formatDui(valor, tope, formato);
	}
	if (key === 'NIT') {
		return formatNit(valor, tope, formato);
	}
	if (key === 'NRC') {
		return formatNrc(valor, tope, formato);
	}

	let body = filtrarPorFormatoCaracteres(valor ?? '', formato);
	if (valida) {
		body = body.substring(0, n);
	}
	return body;
}
