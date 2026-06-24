import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { CData } from 'src/app/FxAPI/CData';
import { ConPartidaImportParam } from './models/con-partida-importar-excel';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaImportarExcelRepository {
	readonly xController = 'CON_PARTIDA';

	constructor(private objData: CData) {}

	importarExcel(model: ConPartidaImportParam): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'ImportarExcel', environment.UrlCONTAAPI);
	}
}
