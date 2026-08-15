import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class BanSoliChequeRepository {
	readonly xController = 'BAN_SOLI_CHEQUE';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCONTAAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Post', environment.UrlCONTAAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Put', xWhere, environment.UrlCONTAAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Delete', xWhere, environment.UrlCONTAAPI);
	}

	enviarSolicitud(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'EnviarSolicitud', xWhere, environment.UrlCONTAAPI);
	}

	cancelarSolicitud(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'CancelarSolicitud', xWhere, environment.UrlCONTAAPI);
	}

	getAllAutorizar(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllAutorizar', xWhere, environment.UrlCONTAAPI);
	}

	autorizarSolicitud(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'AutorizarSolicitud', xWhere, environment.UrlCONTAAPI);
	}
}
