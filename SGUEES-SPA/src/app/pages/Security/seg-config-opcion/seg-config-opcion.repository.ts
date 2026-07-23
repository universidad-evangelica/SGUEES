import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

@Injectable({
	providedIn: 'root',
})
export class SegConfigOpcionRepository {
	readonly xController = 'SEG_CONFIG_OPCION';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSEGURIDADAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSEGURIDADAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSEGURIDADAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSEGURIDADAPI);
	}
}
