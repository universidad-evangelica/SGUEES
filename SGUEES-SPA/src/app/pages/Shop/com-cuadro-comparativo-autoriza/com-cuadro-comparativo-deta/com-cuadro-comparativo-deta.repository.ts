import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComCuadroComparativoDetaRepository {
	readonly xController = 'COM_CUADRO_COMPARATIVO';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'getAllCOM_CUADRO_COMPARATIVO_DETA_AUTORIZAR', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostCOM_CUADRO_COMPARATIVO_DETA', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutCOM_CUADRO_COMPARATIVO_DETA_AUTORIZAR', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteCOM_CUADRO_COMPARATIVO_DETA', xWhere, environment.UrlCOMPRASAPI);
	}
}
