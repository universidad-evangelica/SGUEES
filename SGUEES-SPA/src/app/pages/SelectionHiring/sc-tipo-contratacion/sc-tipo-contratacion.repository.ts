import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScTipoContratacionRepository {
	readonly xController = 'SC_TIPO_CONTRATACION';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
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

	//Funcion para reactivar un registro, se envía el campo ACTIVO en true y el where con el id del registro a reactivar
	reactivate(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put({}, this.xController, 'Reactivate', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	//Funcion para desactivar un registro, se envía el campo ACTIVO en false y el where con el id del registro a desactivar
	desactivate(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put({}, this.xController, 'Desactivate', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
