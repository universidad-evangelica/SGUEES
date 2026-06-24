import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaOperacionRepository {
	readonly xController = 'CON_PARTIDA';

	constructor(private objData: CData) {}

	getAllAplicar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllAplicar', xWhere, environment.UrlCONTAAPI);
	}

	getAllDesAplicar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDesAplicar', xWhere, environment.UrlCONTAAPI);
	}

	getAllAnular(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllAnular', xWhere, environment.UrlCONTAAPI);
	}

	aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCONTAAPI);
	}

	desAplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'DesAplicar', xWhere, environment.UrlCONTAAPI);
	}

	anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Anular', xWhere, environment.UrlCONTAAPI);
	}
}
