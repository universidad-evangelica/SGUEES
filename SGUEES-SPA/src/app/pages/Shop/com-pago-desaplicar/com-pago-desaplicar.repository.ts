import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComPagoDesAplicarRepository {
	readonly xController = 'COM_PAGO';

	constructor(private objData: CData) {}

	getAllDesAplicar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDesAplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	DesAplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'DesAplicar', xWhere, environment.UrlCOMPRASAPI);
	}
}
