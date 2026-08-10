import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaDocRepository {
	readonly xController = 'CON_PARTIDA';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDetaDoc', xWhere, environment.UrlCONTAAPI);
	}
}
