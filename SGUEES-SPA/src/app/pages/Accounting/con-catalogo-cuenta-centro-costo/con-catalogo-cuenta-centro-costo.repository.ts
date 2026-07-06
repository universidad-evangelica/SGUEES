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
	readonly xControllerCatalogo = 'CON_CATALOGO_CUENTA';
	readonly xControllerCentro = 'CON_CENTRO_COSTO';

	constructor(private objData: CData) {}

	/** Grilla catálogo — CON_CATALOGO_CUENTA con permiso de esta opción */
	getCatalogoCuentas(): Observable<IResult> {
		return this.objData.Get(this.xControllerCatalogo,'GetCUENTA_CONTABLE_CON_CTA_CENTRO_COSTO',[],environment.UrlCONTAAPI);
	}

	/** Grilla centros — CON_CENTRO_COSTO con permiso de esta opción */
	getCentrosCosto(): Observable<IResult> {
		return this.objData.Get(this.xControllerCentro,'GetCORR_CENTRO_COSTO_CON_CTA_CENTRO_COSTO',[],environment.UrlCONTAAPI);
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
