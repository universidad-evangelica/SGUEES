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

	getContrataciones(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetContrataciones',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: Envía la petición HTTP para registrar la decisión del candidato (Aplica / No aplica).
	// Cómo lo hace: Realiza un POST con el modelo hacia el endpoint DecideCandidato del controlador SC_BANDEJA_TH.
	decideCandidato(model: any): Observable<IResult> {
		return this.objData.Post(
			model,
			this.xController,
			'DecideCandidato',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: Envía la petición HTTP para confirmar el movimiento de personal de una contratación.
	// Cómo lo hace: Realiza un PUT hacia ConfirmarMovimientoPersonal en SC_BANDEJA_TH con el correlativo y la fecha efectiva.
	confirmarMovimientoPersonal(model: {
		CORR_MOVIMIENTO_PERSONAL: number;
		FECHA_EFECTIVA?: Date | string | null;
	}): Observable<IResult> {
		return this.objData.Put(
			model,
			this.xController,
			'ConfirmarMovimientoPersonal',
			[{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: model.CORR_MOVIMIENTO_PERSONAL }],
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}

	// Qué hace: Envía la petición HTTP para crear el empleado institucional y usuario.
	// Cómo lo hace: Realiza un POST hacia ContratarEmpleado en SC_BANDEJA_TH enviando el correlativo del movimiento de personal.
	contratarEmpleado(model: { CORR_MOVIMIENTO_PERSONAL: number }): Observable<IResult> {
		return this.objData.Post(
			model,
			this.xController,
			'ContratarEmpleado',
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
