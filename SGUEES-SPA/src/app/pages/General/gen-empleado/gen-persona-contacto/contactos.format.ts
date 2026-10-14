// Qué hace: formatos de contactos según catálogo GEN_TIPO_CONTACTO.
// Cómo: teléfono nacional +503; email conserva @; el resto filtra FORMATO_CARACTERES y el tope.

export type FormatoCaracteresContacto = 'NUMEROS' | 'LETRAS' | 'AMBOS';

/** Qué hace: interpreta ACTIVO_CARACTERES (bit / bool / 0-1). */
export function esActivoCaracteresContacto(activo: unknown): boolean {
	return activo === true || activo === 1 || activo === '1' || activo === 'true';
}

/** Qué hace: normaliza FORMATO_CARACTERES al CHECK (LETRAS/NUMEROS/AMBOS). */
export function normalizarFormatoContacto(valor?: string | null): FormatoCaracteresContacto {
	const v = `${valor ?? ''}`.trim().toUpperCase();
	if (v === 'LETRAS' || v === 'NUMEROS' || v === 'AMBOS') {
		return v;
	}
	return 'AMBOS';
}

export function claveTipoContacto(nombreCorto?: string): string {
	return `${nombreCorto ?? ''}`.trim().toUpperCase();
}

export function esTelefonoNacional(nombreCorto?: string): boolean {
	return claveTipoContacto(nombreCorto) === 'TELEFONO_NACION';
}

export function esEmailContacto(nombreCorto?: string): boolean {
	return claveTipoContacto(nombreCorto) === 'EMAIL';
}

/**
 * Qué hace: muestra el tipo según APLICA_PARA y si la persona es extranjera.
 * Cómo: extranjero → EXTRANJEROS|AMBOS; nacional → NACIONALES|AMBOS.
 */
export function contactoVisiblePorAplicaPara(aplicaPara: string | undefined | null, esExtranjero: boolean): boolean {
	const a = `${aplicaPara ?? ''}`.trim().toUpperCase();
	if (!a || a === 'AMBOS') {
		return true;
	}
	if (esExtranjero) {
		return a === 'EXTRANJEROS';
	}
	return a === 'NACIONALES';
}

/** Qué hace: deja solo caracteres del FORMATO_CARACTERES. Letras y números es texto libre. */
export function filtrarPorFormatoContacto(valor: string, formato: FormatoCaracteresContacto): string {
	const raw = valor || '';
	if (formato === 'NUMEROS') {
		return raw.replace(/\D/g, '');
	}
	if (formato === 'LETRAS') {
		return raw.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
	}
	return raw;
}

export function teclaPermitidaContacto(key: string, formato: FormatoCaracteresContacto): boolean {
	if (!key || key.length !== 1) {
		return true;
	}
	if (formato === 'NUMEROS') {
		return /[0-9]/.test(key);
	}
	if (formato === 'LETRAS') {
		return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(key);
	}
	return true;
}

/**
 * Qué hace: máscara +503 XXXX-XXXX. Vacío si no hay dígitos del número.
 * Cómo: el prefijo queda fijo; solo entran los dígitos que van después de "+503 ".
 *       Lo que se escriba antes del prefijo se descarta.
 */
export function formatTelefonoNacional(valor: string): string {
	const raw = `${valor ?? ''}`;
	if (!raw.trim()) {
		return '';
	}

	let source = raw;
	if (!source.startsWith('+503')) {
		const at = source.indexOf('+503');
		if (at >= 0) {
			source = source.slice(at);
		} else {
			let solo = source.replace(/\D/g, '');
			if (solo.startsWith('503') && solo.length > 8) {
				solo = solo.slice(3);
			}
			source = '+503 ' + solo;
		}
	}

	let digits = source.slice(5).replace(/\D/g, '').substring(0, 8);
	if (!digits) {
		return '';
	}
	if (digits.length > 4) {
		digits = digits.slice(0, 4) + '-' + digits.slice(4);
	}
	return '+503 ' + digits;
}

/** Qué hace: correo sin espacios, con tope del catálogo si está activo. */
export function formatEmailContacto(valor: string, maxCaracteres: number | null): string {
	let v = `${valor ?? ''}`.replace(/\s/g, '');
	if (maxCaracteres != null && maxCaracteres > 0) {
		v = v.substring(0, maxCaracteres);
	}
	return v;
}

export function topeContacto(activo: unknown, numero: number): number | null {
	if (!esActivoCaracteresContacto(activo) || Number(numero) <= 0) {
		return null;
	}
	return Number(numero);
}

/**
 * Qué hace: formatea al escribir según el nombre corto del catálogo.
 * Cómo: nacional = máscara; email = texto de correo; resto = filtro de caracteres + tope.
 */
export function aplicarFormatoContacto(
	nombreCorto: string,
	valor: string,
	activoCaracteres: unknown,
	numeroCaracteres: number,
	formatoCaracteres?: string | null
): string {
	if (esTelefonoNacional(nombreCorto)) {
		return formatTelefonoNacional(valor);
	}
	const tope = topeContacto(activoCaracteres, numeroCaracteres);
	if (esEmailContacto(nombreCorto)) {
		return formatEmailContacto(valor, tope);
	}
	const formato = normalizarFormatoContacto(formatoCaracteres);
	let body = filtrarPorFormatoContacto(valor, formato);
	if (tope != null) {
		body = body.substring(0, tope);
	}
	return body;
}

export function maxLengthContactoCampo(
	nombreCorto: string,
	activoCaracteres: unknown,
	numeroCaracteres: number
): number | null {
	if (esTelefonoNacional(nombreCorto)) {
		return 14;
	}
	return topeContacto(activoCaracteres, numeroCaracteres);
}

/**
 * Qué hace: mensaje si el valor no cumple la regla del tipo. Vacío es válido (borra el contacto).
 */
export function mensajeContactoInvalido(
	nombreCorto: string,
	nombreLargo: string,
	valor: string,
	activoCaracteres: unknown,
	numeroCaracteres: number
): string | null {
	const v = `${valor ?? ''}`.trim();
	if (!v) {
		return null;
	}
	const nombre = `${nombreLargo || nombreCorto || 'Contacto'}`.trim();
	if (esTelefonoNacional(nombreCorto)) {
		const digits = v.replace(/\D/g, '').replace(/^503/, '');
		const tope = topeContacto(activoCaracteres, numeroCaracteres) ?? 8;
		if (digits.length !== tope) {
			return `El teléfono nacional debe tener el formato +503 XXXX-XXXX (${tope} dígitos).`;
		}
		return null;
	}
	if (esEmailContacto(nombreCorto)) {
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
			return 'El correo electrónico no tiene un formato válido.';
		}
	}
	return null;
}
