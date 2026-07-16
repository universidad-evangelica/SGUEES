import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

/** Detalle cascada: departamento (mismo controller padre, endpoints Depto). */
@Injectable({
	providedIn: 'root',
})
export class GenDeptoRepository {
	readonly xController = 'GEN_ESTRUCTURA_TERRITORIAL';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDeptos', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValues(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesDeptos', xWhere, environment.UrlGENERALAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Depto', environment.UrlGENERALAPI);
	}

	update(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Depto', [], environment.UrlGENERALAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Depto', xWhere, environment.UrlGENERALAPI);
	}
}
