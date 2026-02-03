import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComSoliCotizacionDetaRepository {
	readonly xController = 'COM_SOLI_COTIZACION';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllCOM_SOLI_COTIZACION_DETA', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostCOM_SOLI_COTIZACION_DETA', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutCOM_SOLI_COTIZACION_DETA', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteCOM_SOLI_COTIZACION_DETA', xWhere, environment.UrlCOMPRASAPI);
	}

  Anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'AnularDeta', xWhere, environment.UrlCOMPRASAPI);
	}
}
