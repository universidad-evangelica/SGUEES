// Acceso HTTP al encabezado territorial (controlador GEN_PAIS).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
// Qué hace: agrupa las llamadas HTTP al controlador GEN_PAIS para el encabezado territorial.
export class GenEstructuraTerritorialRepository {
	readonly xController = 'GEN_PAIS';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de países.
	// Cómo: GET GetAll al controlador GEN_PAIS con los filtros recibidos.
	getAllPaises(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea un país nuevo.
	// Cómo: POST con el modelo al controlador GEN_PAIS.
	createPais(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza un país existente.
	// Cómo: PUT con el modelo y la llave en xWhere al controlador GEN_PAIS.
	updatePais(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: elimina un país.
	// Cómo: DELETE con la llave en xWhere al controlador GEN_PAIS.
	deletePais(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
