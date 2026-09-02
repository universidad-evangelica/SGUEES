import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScExpedienteEntrevistaRepository {
	readonly xController = 'SC_EXPEDIENTE_ENTREVISTA';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
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

	/** Listado desde sc-requisicion-personal (permiso /sc-requisicion-personal|R). */
	getAllForRequisicion(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetAll_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	createForRequisicion(model: any): Observable<IResult> {
		return this.objData.Post(
			model,
			this.xController,
			'Create_SC_REQUISICION_PERSONAL',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	updateForRequisicion(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'Update_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	deleteForRequisicion(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(
			this.xController,
			'Delete_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	/** Confirma reunión realizada (ESTADO=REALIZADA + resultado/resumen). */
	markAsRealizadaForRequisicion(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'MarkAsRealizada_SC_REQUISICION_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
