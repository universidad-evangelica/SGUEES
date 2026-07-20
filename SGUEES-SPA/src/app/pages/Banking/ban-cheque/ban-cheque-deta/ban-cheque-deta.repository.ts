import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class BanChequeDetaRepository {
	readonly xController = 'BAN_DOCUMENTO_DETA';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllCheque', xWhere, environment.UrlCONTAAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostCheque', environment.UrlCONTAAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutCheque', xWhere, environment.UrlCONTAAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteCheque', xWhere, environment.UrlCONTAAPI);
	}
}
