import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScBandejaThRepository {
	readonly xController = 'SC_BANDEJA_TH';

	constructor(private objData: CData) {}

	getRequisiciones(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetRequisiciones',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	getBitacoraRequisicion(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetBitacoraRequisicion',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	getCandidatos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetCandidatos',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
