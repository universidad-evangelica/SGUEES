// Acceso HTTP al controlador GEN_DIVISION de la API General.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
// Qué hace: agrupa las llamadas HTTP al controlador GEN_DIVISION.
export class GenDivisionRepository {
	readonly xController = 'GEN_DIVISION';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de divisiones.
	// Cómo: GET GetAll al controlador GEN_DIVISION con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: consulta una división puntual.
	// Cómo: GET Get al controlador GEN_DIVISION con la llave en xWhere.
	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea una división nueva.
	// Cómo: POST con el modelo al controlador GEN_DIVISION.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza una división existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador GEN_DIVISION.
	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: elimina una división.
	// Cómo: DELETE con la llave en xWhere al controlador GEN_DIVISION.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
