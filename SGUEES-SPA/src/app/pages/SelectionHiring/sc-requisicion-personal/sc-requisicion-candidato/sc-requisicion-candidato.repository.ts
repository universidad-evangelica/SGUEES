import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScRequisicionCandidatoRepository {
	readonly xController = 'SC_REQUISICION_CANDIDATO';

	constructor(private objData: CData) {}

	decide(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Decide', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getPostulacionesExpediente(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetAll_SC_EXPEDIENTE_CANDIDATO',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
