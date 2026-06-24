import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { CData } from 'src/app/FxAPI/CData';
import { ConCatalogoCuentaImportParam, ConCentroCostoImportParam } from './models/con-contabilidad-importar-excel';

@Injectable({
	providedIn: 'root',
})
export class ConContabilidadImportarExcelRepository {
	constructor(private objData: CData) {}

	importarCuentas(model: ConCatalogoCuentaImportParam): Observable<IResult> {
		return this.objData.Post(model, 'CON_CATALOGO_CUENTA', 'ImportarExcel', environment.UrlCONTAAPI);
	}

	importarCentros(model: ConCentroCostoImportParam): Observable<IResult> {
		return this.objData.Post(model, 'CON_CENTRO_COSTO', 'ImportarExcel', environment.UrlCONTAAPI);
	}
}
