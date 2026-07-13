import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

/** Detalle cascada: distrito (mismo controller padre, endpoints Distrito). */
@Injectable({
	providedIn: 'root',
})
export class GenDistritoRepository {
	readonly xController = 'GEN_ESTRUCTURA_TERRITORIAL';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDistritos', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValues(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesDistritos', xWhere, environment.UrlGENERALAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Distrito', environment.UrlGENERALAPI);
	}

	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Distrito', [], environment.UrlGENERALAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Distrito', xWhere, environment.UrlGENERALAPI);
	}
}
