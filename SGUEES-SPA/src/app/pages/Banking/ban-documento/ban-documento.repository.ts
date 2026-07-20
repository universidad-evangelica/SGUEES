import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { IResult } from 'src/app/FxAPI/IResult';

import { IParam } from 'src/app/FxAPI/IParam';

import { CData } from 'src/app/FxAPI/CData';

export type BanDocumentoApiScope = 'documento' | 'cheque';

export type BanDocumentoProcesoScope =
	| 'documento-aplicar'
	| 'cheque-aplicar'
	| 'cheque-imprimir'
	| 'documento-anular'
	| 'cheque-anular';

@Injectable({
	providedIn: 'root',
})
export class BanDocumentoRepository {
	readonly xController = 'BAN_DOCUMENTO';

	constructor(private objData: CData) {}

	get(scope: BanDocumentoApiScope | BanDocumentoProcesoScope, xWhere: IParam[]): Observable<IResult> {
		const method = this.resolveGetMethod(scope);
		return this.objData.Get(this.xController, method, xWhere, environment.UrlCONTAAPI);
	}

	create(scope: BanDocumentoApiScope, model: any): Observable<IResult> {
		const action = scope === 'cheque' ? 'PostCheque' : 'PostDocumento';
		return this.objData.Post(model, this.xController, action, environment.UrlCONTAAPI);
	}

	update(scope: BanDocumentoApiScope, model: any, xWhere: IParam[]): Observable<IResult> {
		const action = scope === 'cheque' ? 'PutCheque' : 'PutDocumento';
		return this.objData.Put(model, this.xController, action, xWhere, environment.UrlCONTAAPI);
	}

	delete(scope: BanDocumentoApiScope, xWhere: IParam[]): Observable<IResult> {
		const action = scope === 'cheque' ? 'DeleteCheque' : 'DeleteDocumento';
		return this.objData.Delete(this.xController, action, xWhere, environment.UrlCONTAAPI);
	}

	aplicar(scope: 'documento-aplicar' | 'cheque-aplicar', model: any, xWhere: IParam[]): Observable<IResult> {
		const action = scope === 'cheque-aplicar' ? 'AplicarCheque' : 'AplicarDocumento';
		return this.objData.Put(model, this.xController, action, xWhere, environment.UrlCONTAAPI);
	}

	anular(scope: 'documento-anular' | 'cheque-anular', model: any, xWhere: IParam[]): Observable<IResult> {
		const action = scope === 'cheque-anular' ? 'AnularCheque' : 'AnularDocumento';
		return this.objData.Put(model, this.xController, action, xWhere, environment.UrlCONTAAPI);
	}

	imprimirCheque(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ImprimirCheque', xWhere, environment.UrlCONTAAPI);
	}

	getChequeImprimirDatos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetChequeImprimirDatos', xWhere, environment.UrlCONTAAPI);
	}

	getAllContabilizar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDocumentoContabilizar', xWhere, environment.UrlCONTAAPI);
	}

	contabilizar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ContabilizarDocumento', xWhere, environment.UrlCONTAAPI);
	}

	descontabilizar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'DesContabilizarDocumento', xWhere, environment.UrlCONTAAPI);
	}

	private resolveGetMethod(scope: BanDocumentoApiScope | BanDocumentoProcesoScope): string {
		switch (scope) {
			case 'cheque':
				return 'GetAllCheque';
			case 'documento-aplicar':
				return 'GetAllDocumentoAplicar';
			case 'cheque-aplicar':
				return 'GetAllChequeAplicar';
			case 'cheque-imprimir':
				return 'GetAllChequeImprimir';
			case 'documento-anular':
				return 'GetAllDocumentoAnular';
			case 'cheque-anular':
				return 'GetAllChequeAnular';
			default:
				return 'GetAllDocumento';
		}
	}
}
