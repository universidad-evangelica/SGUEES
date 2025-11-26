import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class SegUsuarioOpcionRepository {
	readonly xController = 'SEG_USUARIO';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllSEG_USUARIO_OPCION', xWhere, environment.UrlSEGURIDADAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostSEG_USUARIO_OPCION', environment.UrlSEGURIDADAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutSEG_USUARIO_OPCION', xWhere, environment.UrlSEGURIDADAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteSEG_USUARIO_OPCION', xWhere, environment.UrlSEGURIDADAPI);
	}
}
