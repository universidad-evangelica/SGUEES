import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComOrdenCompraRepository {
	readonly xController = 'COM_ORDEN_COMPRA';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCOMPRASAPI);
	}

	getOne(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlCOMPRASAPI);
	}

	Aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	Anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Anular', xWhere, environment.UrlCOMPRASAPI);
	}

	DesAplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'DesAplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	getPDF(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'getPDF', xWhere, environment.UrlCOMPRASAPI);
	}
}
