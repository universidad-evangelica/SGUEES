import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

/** Detalle cascada: municipio (mismo controller padre, endpoints Municipio). */
@Injectable({
	providedIn: 'root',
})
export class GenMunicipioRepository {
	readonly xController = 'GEN_ESTRUCTURA_TERRITORIAL';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllMunicipios', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValues(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesMunicipios', xWhere, environment.UrlGENERALAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Municipio', environment.UrlGENERALAPI);
	}

	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Municipio', [], environment.UrlGENERALAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Municipio', xWhere, environment.UrlGENERALAPI);
	}
}
