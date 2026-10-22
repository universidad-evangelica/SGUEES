// Qué hace: servicio de lógica de negocio para la gestión de versiones de plantillas de correo.
// Cómo lo hace: interactúa con GenParametroPlantillaVersionRepository para listar, crear y activar versiones.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { GenParametroPlantillaVersion } from './models/gen-parametro-plantilla-version';
import { GenParametroPlantillaVersionRepository } from './gen-parametro-plantilla-version.repository';

@Injectable({ providedIn: 'root' })
export class GenParametroPlantillaVersionService {
	constructor(private repo: GenParametroPlantillaVersionRepository) {}

	// Qué hace: valida las reglas mínimas para una nueva versión.
	// Cómo lo hace: verifica que el motivo de la versión no esté vacío si se requiere justificación.
	esValidaNuevaVersion(motivo: string, msg: Function): boolean {
		if (!motivo || motivo.trim() === '') {
			msg('Debe ingresar el motivo de la nueva versión.', NotifyType.Warning);
			return false;
		}
		if (motivo.trim().length > 255) {
			msg('El motivo no puede exceder los 255 caracteres.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	// Qué hace: obtiene todas las versiones de una plantilla específica.
	// Cómo lo hace: envía el parámetro CORR_PARAMETRO_PLANTILLA al repositorio.
	getAll(corrParametroPlantilla: number): Observable<IResult> {
		return this.repo.getAll([
			{ Parameter: 'CORR_PARAMETRO_PLANTILLA', Value: corrParametroPlantilla }
		]);
	}

	// Qué hace: solicita la creación de una nueva versión.
	// Cómo lo hace: delega la petición al repositorio.
	crearVersion(model: GenParametroPlantillaVersion): Observable<IResult> {
		return this.repo.crearVersion(model);
	}

	// Qué hace: establece una versión histórica como la versión activa.
	// Cómo lo hace: envía CORR_PARAMETRO_PLANTILLA y NUMERO_VERSION al repositorio.
	activarVersion(corrParametroPlantilla: number, numeroVersion: number): Observable<IResult> {
		return this.repo.activarVersion({
			CORR_PARAMETRO_PLANTILLA: corrParametroPlantilla,
			NUMERO_VERSION: numeroVersion
		});
	}
}
