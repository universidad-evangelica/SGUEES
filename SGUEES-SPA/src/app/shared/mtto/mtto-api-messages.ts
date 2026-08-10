import { NotifyType } from '../models/NotifyType';

export const EMPRESA_WARNING_ERROR_CODE = 4100;

const API_CONNECTION_MESSAGE =
	'No se pudo comunicar con el servidor. Verifique que la API esté en ejecución e intente nuevamente.';

export function getLoginEmpresaWarningMessage(): string {
	return 'Su usuario no tiene una empresa por defecto asignada. Solicite a administración que configure una empresa por defecto en el sistema.';
}

export function getEmpresaWarningMessage(etiquetaRegistro = 'el registro'): string {
	return `No se pudo guardar ${etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.`;
}

export function isEmpresaWarningResponse(response: any): boolean {
	return response?.ErrorCode === EMPRESA_WARNING_ERROR_CODE;
}

export function isEmpresaFkErrorMessage(message: string): boolean {
	const value = `${message ?? ''}`.toLowerCase();
	return (
		value.includes('gen_empresa') ||
		value.includes('foreign key') ||
		value.includes('clave externa') ||
		value.includes('reference constraint') ||
		value.includes('conflicted with the foreign key') ||
		value.includes('no tiene una empresa asignada')
	);
}

/** Warning de negocio: duplicados, relaciones, concurrencia — no falla técnica. */
export function isBusinessWarningMessage(message: string): boolean {
	const value = cleanApiMessage(message).toLowerCase();
	return (
		value.includes('ya existe') ||
		value.includes('duplicad') ||
		value.includes('ya está registrad') ||
		value.includes('ya esta registrad') ||
		value.includes('ya ha sido ingresado') ||
		value.includes('registros asociados') ||
		value.includes('hijos asociados') ||
		value.includes('registros relacionados') ||
		value.includes('otro usuario') ||
		value.includes('mismo tiempo')
	);
}

export function cleanApiMessage(message: unknown): string {
	return `${message ?? ''}`.replace(/^error:\s*/i, '').trim();
}

export function mapApiErrorMessage(message: string, etiquetaRegistro = 'el registro'): string {
	const cleanMessage = cleanApiMessage(message);
	const value = cleanMessage.toLowerCase();

	if (isEmpresaFkErrorMessage(cleanMessage) || value.includes('no tiene una empresa asignada')) {
		return getEmpresaWarningMessage(etiquetaRegistro);
	}
	// Conserva el mensaje de la API para que se vea el atributo (nombre, código, etc.).
	if (
		value.includes('ya existe') ||
		value.includes('duplicad') ||
		value.includes('ya está registrad') ||
		value.includes('ya esta registrad')
	) {
		return cleanMessage;
	}
	if (value.includes('hijos asociados') || value.includes('registros asociados') || value.includes('asociados')) {
		return 'No se puede eliminar porque tiene registros relacionados. Revise los datos asociados antes de continuar.';
	}

	return cleanMessage;
}

function isConnectionFailure(value: unknown): boolean {
	const text = `${value ?? ''}`.trim();
	if (!text || text === '[object ProgressEvent]' || text === '[object Object]') {
		return true;
	}

	const lower = text.toLowerCase();
	return lower.includes('http failure') || lower.includes('progress event');
}

export function getApiErrorMessage(error: any): string {
	if (typeof error === 'string') {
		const trimmed = error.trim();
		if (isConnectionFailure(trimmed)) {
			return API_CONNECTION_MESSAGE;
		}
		return trimmed || API_CONNECTION_MESSAGE;
	}

	if (error instanceof ProgressEvent || Object.prototype.toString.call(error) === '[object ProgressEvent]') {
		return API_CONNECTION_MESSAGE;
	}

	if (error?.error instanceof ProgressEvent) {
		return API_CONNECTION_MESSAGE;
	}

	const apiMessage = error?.error?.ErrorMessage || error?.ErrorMessage || error?.error?.message || error?.message;
	if (typeof apiMessage === 'string' && apiMessage.trim()) {
		if (isConnectionFailure(apiMessage)) {
			return API_CONNECTION_MESSAGE;
		}
		return apiMessage;
	}

	return API_CONNECTION_MESSAGE;
}

export function getNotifyTypeFromResponse(response: any, etiquetaRegistro = 'el registro'): NotifyType {
	if (isEmpresaWarningResponse(response)) {
		return NotifyType.Warning;
	}

	const message = response?.ErrorMessage || '';
	if (Number(response?.ErrorCode) === 2627 || isBusinessWarningMessage(message)) {
		return NotifyType.Warning;
	}

	return NotifyType.Error;
}

export function getNotifyTypeFromError(error: any, etiquetaRegistro = 'el registro'): NotifyType {
	const body = error?.error;
	if (body && typeof body === 'object' && (body.ErrorMessage !== undefined || body.ErrorCode !== undefined)) {
		return getNotifyTypeFromResponse(body, etiquetaRegistro);
	}

	// BadRequest con CResult intacto (sin pasar por string del interceptor).
	if (error && typeof error === 'object' && (error.ErrorMessage !== undefined || error.ErrorCode !== undefined)) {
		return getNotifyTypeFromResponse(error, etiquetaRegistro);
	}

	const message = getApiErrorMessage(error);
	if (isEmpresaFkErrorMessage(message) || isBusinessWarningMessage(message)) {
		return NotifyType.Warning;
	}

	return NotifyType.Error;
}
