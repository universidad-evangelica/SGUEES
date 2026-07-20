// Acceso HTTP al detalle cascada municipio (GEN_MUNICIPIO).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
// Qué hace: agrupa las llamadas HTTP al controlador GEN_MUNICIPIO.
export class GenMunicipioRepository {
	readonly xController = 'GEN_MUNICIPIO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de municipios.
	// Cómo: GET GetAll al controlador GEN_MUNICIPIO con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea un municipio nuevo.
	// Cómo: POST con el modelo al controlador GEN_MUNICIPIO.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza un municipio existente.
	// Cómo: PUT con el modelo al controlador GEN_MUNICIPIO.
	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', [], environment.UrlGENERALAPI);
	}

	// Qué hace: elimina un municipio.
	// Cómo: DELETE con la llave en xWhere al controlador GEN_MUNICIPIO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
