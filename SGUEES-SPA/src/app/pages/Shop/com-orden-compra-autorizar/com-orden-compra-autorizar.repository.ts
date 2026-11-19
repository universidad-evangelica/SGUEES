import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComOrdenCompraAutorizarRepository {
	readonly xController = 'COM_ORDEN_COMPRA';
	readonly xControllerDeta = 'COM_ORDEN_COMPRA_DETA';

	constructor(private objData: CData) {}

	getPendientesAutorizar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPendientesAutorizar', xWhere, environment.UrlCOMPRASAPI);
	}

	Autorizar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Autorizar', xWhere, environment.UrlCOMPRASAPI);
	}

	Anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Anular', xWhere, environment.UrlCOMPRASAPI);
	}

	getDetalle(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xControllerDeta, 'GetAll', xWhere, environment.UrlCOMPRASAPI);
	}
}
