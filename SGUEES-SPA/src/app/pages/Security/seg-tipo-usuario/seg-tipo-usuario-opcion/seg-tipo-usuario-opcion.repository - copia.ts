import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class SegTipoUsuarioOpcionRepository {
	readonly xController = 'SEG_TIPO_USUARIO';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllSEG_TIPO_USUARIO_OPCION', xWhere, environment.UrlSEGURIDADAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Post_TIPO_SEG_USUARIO_OPCION', environment.UrlSEGURIDADAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutSEG_TIPO_USUARIO_OPCION', xWhere, environment.UrlSEGURIDADAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteSEG_TIPO_USUARIO_OPCION', xWhere, environment.UrlSEGURIDADAPI);
	}
}
