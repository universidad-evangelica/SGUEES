import { NotifyType } from '../models/NotifyType';

export const EMPRESA_WARNING_ERROR_CODE = 4100;

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

export function cleanApiMessage(message: unknown): string {
	return `${message ?? ''}`.replace(/^error:\s*/i, '').trim();
}

export function mapApiErrorMessage(message: string, etiquetaRegistro = 'el registro'): string {
	const cleanMessage = cleanApiMessage(message);
	const value = cleanMessage.toLowerCase();

	if (isEmpresaFkErrorMessage(cleanMessage) || value.includes('no tiene una empresa asignada')) {
		return getEmpresaWarningMessage(etiquetaRegistro);
	}
	if (value.includes('ya existe') || value.includes('duplicad')) {
		return 'Ya existe un registro con ese código. Escriba otro código para continuar.';
	}
	if (value.includes('hijos asociados') || value.includes('registros asociados') || value.includes('asociados')) {
		return 'No se puede eliminar porque tiene registros relacionados. Revise los datos asociados antes de continuar.';
	}

	return cleanMessage;
}

export function getApiErrorMessage(error: any): string {
	if (typeof error === 'string' && error.trim()) {
		return error;
	}

	return error?.error?.ErrorMessage || error?.error?.message || error?.message || 'Ocurrió un error al procesar la solicitud.';
}

export function getNotifyTypeFromResponse(response: any, etiquetaRegistro = 'el registro'): NotifyType {
	if (isEmpresaWarningResponse(response)) {
		return NotifyType.Warning;
	}

	const message = (response?.ErrorMessage || '').toLowerCase();
	if (
		response?.ErrorCode === 2627 ||
		message.includes('ya existe') ||
		message.includes('duplicad') ||
		message.includes('ya ha sido ingresado') ||
		message.includes('registros asociados') ||
		message.includes('hijos asociados')
	) {
		return NotifyType.Warning;
	}

	return NotifyType.Error;
}

export function getNotifyTypeFromError(error: any, etiquetaRegistro = 'el registro'): NotifyType {
	const body = error?.error;
	if (body && typeof body === 'object' && body.ErrorMessage !== undefined) {
		return getNotifyTypeFromResponse(body, etiquetaRegistro);
	}

	return isEmpresaFkErrorMessage(getApiErrorMessage(error)) ? NotifyType.Warning : NotifyType.Error;
}
