import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ScExpedienteCandidatoRepository {
	readonly xController = 'SC_EXPEDIENTE_CANDIDATO';

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

	getEstadoAsociacion(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetEstadoAsociacion', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	asociarSolicitud(model: { CORR_SOLICITUD_EMPLEO: number; CREAR_EXPEDIENTE: boolean }): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'AsociarSolicitud', environment.UrlSELECCIONCONTRATACIONAPI);
	}
}
