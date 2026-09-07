import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScRequisicionPersonalRepository {
	readonly xController = 'SC_REQUISICION_PERSONAL';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	/** Bitácora de flujo de la requisición (GetAllAsyncBitacoraByCORR_REQUISICION). */
	getBitacora(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetCORR_BITACORA_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	/** Candidatos en proceso de selección asociados a la requisición. */
	getCandidatos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetCORR_CANDIDATOS_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	/**
	 * Lookup de descriptores por unidad + puesto (endpoint en SC_DESCRIPTOR_PUESTO:
	 * GetCORR_DESCRIPTOR_PUESTO_BY_PUESTO_SC_REQUISICION_PERSONAL).
	 */
	getDescriptorPuesto(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			'SC_DESCRIPTOR_PUESTO',
			'GetCORR_DESCRIPTOR_PUESTO_BY_PUESTO_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
