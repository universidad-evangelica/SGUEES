// Qué hace: capa de acceso HTTP para el catálogo de plantillas de contrato.
// Cómo lo hace: invoca los endpoints del controller GEN_PLANTILLA_CONTRATO mediante CData hacia GENERAL API.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: repositorio HTTP de plantillas de contrato.
// Cómo lo hace: expone getAll, get, create, update y delete contra GEN_PLANTILLA_CONTRATO.
export class GenPlantillaContratoRepository {
	readonly xController = 'GEN_PLANTILLA_CONTRATO';

	constructor(private objData: CData) {}

	// Qué hace: obtiene el listado de plantillas de contrato.
	// Cómo lo hace: ejecuta Get sobre GetAll con los filtros recibidos en GENERAL API.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: obtiene una plantilla de contrato puntual por su clave.
	// Cómo lo hace: ejecuta Get sobre Get con los filtros recibidos en GENERAL API.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: registra una nueva plantilla de contrato.
	// Cómo lo hace: ejecuta Post con el modelo hacia GEN_PLANTILLA_CONTRATO en GENERAL API.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza una plantilla de contrato existente.
	// Cómo lo hace: ejecuta Put enviando el modelo y parámetros de clave hacia GENERAL API.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: elimina una plantilla de contrato.
	// Cómo lo hace: ejecuta Delete con los parámetros de clave hacia GENERAL API.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: consulta la lista agrupada de parámetros disponibles para plantillas de contrato.
	// Cómo lo hace: invoca Get sobre GetParametrosDisponibles en GENERAL API.
	getParametrosDisponibles(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetParametrosDisponibles', [], environment.UrlGENERALAPI);
	}

	// Qué hace: consulta todas las versiones registradas para una plantilla de contrato.
	// Cómo lo hace: invoca Get sobre GetVersiones en GENERAL API enviando CORR_PLANTILLA_CONTRATO.
	getVersiones(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetVersiones', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: registra una nueva versión v2+ vinculada a v1 como versión padre.
	// Cómo lo hace: invoca Post sobre CrearVersion en GENERAL API con el contenido HTML y observación.
	crearVersion(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'CrearVersion', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza el contenido HTML de la versión v2+ activa actual.
	// Cómo lo hace: invoca Post sobre ActualizarVersion en GENERAL API con plantilla, versión y cuerpo HTML.
	actualizarVersion(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'ActualizarVersion', environment.UrlGENERALAPI);
	}

	// Qué hace: establece una versión histórica v2+ como versión activa de la plantilla.
	// Cómo lo hace: invoca Post sobre ActivarVersion en GENERAL API enviando plantilla y versión.
	activarVersion(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'ActivarVersion', environment.UrlGENERALAPI);
	}

	// Qué hace: consulta la bitácora de movimientos de una plantilla de contrato.
	// Cómo lo hace: invoca Get sobre GetBitacora en GENERAL API enviando CORR_PLANTILLA_CONTRATO.
	getBitacora(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetBitacora', xWhere, environment.UrlGENERALAPI);
	}
}

