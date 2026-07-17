import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

// Repositorio del encabezado (país).
@Injectable({
	providedIn: 'root',
})
export class GenEstructuraTerritorialRepository {
	readonly xController = 'GEN_PAIS';

	constructor(private objData: CData) {}

	// Consulta el listado de países mediante el endpoint territorial.
	getAllPaises(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para crear un país.
	createPais(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para actualizar el país indicado.
	updatePais(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlGENERALAPI);
	}

	// Envía al API la solicitud para eliminar el país indicado.
	deletePais(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlGENERALAPI);
	}
}
