import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ConCatalogoCuentaCentroCostoRepository {
	readonly xController = 'CON_CATALOGO_CUENTA_CENTRO_COSTO';

	constructor(private objData: CData) {}

	getCatalogoCuentas(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetCatalogoCuentas', [], environment.UrlCONTAAPI);
	}

	getCentrosCosto(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetCentrosCosto', [], environment.UrlCONTAAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCONTAAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlCONTAAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlCONTAAPI);
	}
}
