// Acceso HTTP al API Requerimiento Organizacional (controller SC correspondiente).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: agrupa las llamadas HTTP al controlador SC_REQUERIMIENTO_ORGANIZACIONAL.
export class ScRequerimientoOrganizacionalRepository {
	readonly xController = 'SC_REQUERIMIENTO_ORGANIZACIONAL';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de requerimientos organizacionales.
	// Cómo: GET GetAll al controlador SC_REQUERIMIENTO_ORGANIZACIONAL con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: consulta un requerimiento organizacional puntual.
	// Cómo: GET Get al controlador SC_REQUERIMIENTO_ORGANIZACIONAL con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: crea un requerimiento organizacional nuevo.
	// Cómo: POST con el modelo al controlador SC_REQUERIMIENTO_ORGANIZACIONAL.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: actualiza un requerimiento organizacional existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador SC_REQUERIMIENTO_ORGANIZACIONAL.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: elimina un requerimiento organizacional.
	// Cómo: DELETE con la llave en xWhere al controlador SC_REQUERIMIENTO_ORGANIZACIONAL.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	// Qué hace: cambia el estado activo/inactivo de un requerimiento organizacional.
	// Cómo: PUT a ActivarInactivar con el modelo y la llave en xWhere.
	activarInactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ActivarInactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
