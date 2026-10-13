// Qué hace: capa de acceso HTTP para las plantillas de correo electrónico.
// Cómo lo hace: realiza peticiones GET, POST, PUT y DELETE hacia el controller GEN_PARAMETRO_PLANTILLA en GENERAL API.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenParametroPlantillaRepository {
	readonly xController = 'GEN_PARAMETRO_PLANTILLA';

	constructor(private objData: CData) {}

	// Qué hace: obtiene todas las plantillas filtradas por los parámetros proporcionados.
	// Cómo lo hace: invoca CData.Get hacia el endpoint GetAll de GENERAL API.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: obtiene una plantilla específica por su clave primaria o filtros.
	// Cómo lo hace: invoca CData.Get hacia el endpoint Get de GENERAL API.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: envía la solicitud de inserción de una nueva plantilla.
	// Cómo lo hace: invoca CData.Post con el objeto plantilla hacia GENERAL API.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: envía la actualización de una plantilla existente.
	// Cómo lo hace: invoca CData.Put con el objeto y parámetros de clave hacia GENERAL API.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: solicita la eliminación de una plantilla de correo.
	// Cómo lo hace: invoca CData.Delete con los parámetros de clave hacia GENERAL API.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
