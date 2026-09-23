import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScMovimientoPersonalRepository {
	readonly xController = 'SC_MOVIMIENTO_PERSONAL';

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

	autoriza(model: any): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'Autoriza',
			[{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: model.CORR_MOVIMIENTO_PERSONAL }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	confirmar(model: {
		CORR_MOVIMIENTO_PERSONAL: number;
		FECHA_EFECTIVA?: Date | string | null;
	}): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'Confirmar',
			[{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: model.CORR_MOVIMIENTO_PERSONAL }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	getBitacora(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetCORR_BITACORA_SC_MOVIMIENTO_PERSONAL',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	getRequisicionAsociada(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetRequisicionAsociada',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	registrarFechaIngreso(model: {
		CORR_MOVIMIENTO_PERSONAL: number;
		FECHA_INGRESO_PROPUESTA?: Date | string | null;
	}): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'RegistrarFechaIngreso',
			[{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: model.CORR_MOVIMIENTO_PERSONAL }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
