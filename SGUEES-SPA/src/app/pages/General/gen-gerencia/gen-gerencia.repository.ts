// Acceso HTTP al controlador GEN_GERENCIA de la API General.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: agrupa las llamadas HTTP al controlador GEN_GERENCIA.
export class GenGerenciaRepository {
	readonly xController = 'GEN_GERENCIA';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de gerencias.
	// Cómo: GET GetAll al controlador GEN_GERENCIA con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: consulta una gerencia puntual.
	// Cómo: GET Get al controlador GEN_GERENCIA con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea una gerencia nueva.
	// Cómo: POST con el modelo al controlador GEN_GERENCIA.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza una gerencia existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador GEN_GERENCIA.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: elimina una gerencia.
	// Cómo: DELETE con la llave en xWhere al controlador GEN_GERENCIA.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
