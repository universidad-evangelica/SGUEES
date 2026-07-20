import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { IResult } from 'src/app/FxAPI/IResult';

import { IParam } from 'src/app/FxAPI/IParam';

import { CData } from 'src/app/FxAPI/CData';



export type BanDocumentoDetaApiScope = 'documento' | 'cheque';



@Injectable({

	providedIn: 'root',

})

export class BanDocumentoDetaRepository {

	readonly xController = 'BAN_DOCUMENTO_DETA';



	constructor(private objData: CData) {}



	get(scope: BanDocumentoDetaApiScope, xWhere: IParam[]): Observable<IResult> {

		const method = scope === 'cheque' ? 'GetAllCheque' : 'GetAllDocumento';

		return this.objData.Get(this.xController, method, xWhere, environment.UrlCONTAAPI);

	}



	create(scope: BanDocumentoDetaApiScope, model: any): Observable<IResult> {

		const action = scope === 'cheque' ? 'PostCheque' : 'PostDocumento';

		return this.objData.Post(model, this.xController, action, environment.UrlCONTAAPI);

	}



	update(scope: BanDocumentoDetaApiScope, model: any, xWhere: IParam[]): Observable<IResult> {

		const action = scope === 'cheque' ? 'PutCheque' : 'PutDocumento';

		return this.objData.Put(model, this.xController, action, xWhere, environment.UrlCONTAAPI);

	}



	delete(scope: BanDocumentoDetaApiScope, xWhere: IParam[]): Observable<IResult> {

		const action = scope === 'cheque' ? 'DeleteCheque' : 'DeleteDocumento';

		return this.objData.Delete(this.xController, action, xWhere, environment.UrlCONTAAPI);

	}

}


