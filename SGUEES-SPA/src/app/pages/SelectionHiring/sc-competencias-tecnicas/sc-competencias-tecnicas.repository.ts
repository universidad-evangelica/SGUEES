import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScCompetenciasTecnicasRepository {
	readonly xController = 'SC_COMPETENCIAS_TECNICAS';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getPadres(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPadres', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getNextCodigo(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetNextCodigo', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	activar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Activar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	desactivar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Desactivar', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
