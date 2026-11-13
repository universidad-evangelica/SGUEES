import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

@Injectable({ providedIn: 'root' })
export class ConPartidaContrapartidaRepository {
	readonly xController = 'CON_PARTIDA';

	constructor(private objData: CData) {}

	getElegibles(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllContrapartidaElegible', xWhere, environment.UrlCONTAAPI);
	}

	getPeriodosDestino(): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPeriodosDestinoContrapartida', [], environment.UrlCONTAAPI);
	}

	generar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'GenerarContrapartida', xWhere, environment.UrlCONTAAPI);
	}
}
