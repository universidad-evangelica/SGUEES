// Qué hace: repositorio HTTP para el versionamiento de plantillas de correo.
// Cómo lo hace: realiza peticiones GET y POST al controller GEN_PARAMETRO_PLANTILLA_VERSION en GENERAL API.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenParametroPlantillaVersionRepository {
	readonly xController = 'GEN_PARAMETRO_PLANTILLA_VERSION';

	constructor(private objData: CData) {}

	// Qué hace: obtiene todas las versiones de una plantilla.
	// Cómo lo hace: llama a CData.Get hacia el endpoint GetAll.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: obtiene una versión específica de la plantilla.
	// Cómo lo hace: llama a CData.Get hacia el endpoint Get.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: registra una nueva versión para la plantilla.
	// Cómo lo hace: envía el payload mediante POST al endpoint CrearVersion.
	crearVersion(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'CrearVersion', environment.UrlGENERALAPI);
	}

	// Qué hace: activa una versión histórica de la plantilla.
	// Cómo lo hace: envía el parámetro de versión al endpoint ActivarVersion.
	activarVersion(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'ActivarVersion', environment.UrlGENERALAPI);
	}
}
