// Acceso HTTP al detalle cascada departamento (GEN_DEPTO).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
// Qué hace: agrupa las llamadas HTTP al controlador GEN_DEPTO.
export class GenDeptoRepository {
	readonly xController = 'GEN_DEPTO';

	constructor(private objData: CData) {}

	// Qué hace: consulta el listado de departamentos.
	// Cómo: GET GetAll al controlador GEN_DEPTO con los filtros recibidos.
	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Qué hace: crea un departamento nuevo.
	// Cómo: POST con el modelo al controlador GEN_DEPTO.
	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Qué hace: actualiza un departamento existente.
	// Cómo: PUT con el modelo al controlador GEN_DEPTO.
	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', [], environment.UrlGENERALAPI);
	}

	// Qué hace: elimina un departamento.
	// Cómo: DELETE con la llave en xWhere al controlador GEN_DEPTO.
	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
