import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScBandejaActoresRepository {
	readonly xController = 'SC_BANDEJA_ACTORES';

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

	getUnidades(): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetUnidades',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	getKpis(): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetKpis',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	autorizaRequisicion(model: any): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'AutorizaRequisicion',
			[],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	decideCandidato(model: any): Observable<IResult> {
		return this.objData.Post(
			model,
			this.xController,
			'DecideCandidato',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
