import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ScSolicitudEmpleoRepository {
	readonly xController = 'SC_SOLICITUD_EMPLEO';
	readonly xControllerToken = 'SC_SOLICITUD_EMPLEO_TOKEN';
	readonly xControllerPersonaDatos = 'SC_PERSONA_DATOS';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
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

	desactivate(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put({}, this.xController, 'Desactivate', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	reactivate(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put({}, this.xController, 'Reactivate', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getAllToken(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xControllerToken, 'GetAll', xWhere, environment.UrlSELECCIONCONTRATACIONAPI);
	}

	generarToken(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xControllerToken, 'GenerarToken', environment.UrlSELECCIONCONTRATACIONAPI);
	}

	getPersonaDatos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(
			this.xControllerPersonaDatos,
			'GetCORR_PERSONA_DATOS_SC_SOLICITUD_EMPLEO',
			xWhere,
			environment.UrlSELECCIONCONTRATACIONAPI
		);
	}
}
