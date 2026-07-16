import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

/** Repositorio del encabezado (país), análogo a `com-cotizacion.repository`. */
@Injectable({
	providedIn: 'root',
})
export class GenEstructuraTerritorialRepository {
	readonly xController = 'GEN_ESTRUCTURA_TERRITORIAL';

	constructor(private objData: CData) {}

	getAllPaises(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllPaises', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValuesPaises(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesPaises', xWhere, environment.UrlGENERALAPI);
	}

	createPais(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Pais', environment.UrlGENERALAPI);
	}

	updatePais(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Pais', xWhere, environment.UrlGENERALAPI);
	}

	deletePais(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Pais', xWhere, environment.UrlGENERALAPI);
	}
}
