import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({ providedIn: 'root' })
export class BanConciliaBancariaRepository {
	readonly xController = 'BAN_CONCILIA_BANCARIA';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCONTAAPI);
	}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'Get', xWhere, environment.UrlCONTAAPI);
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

	getPendientes(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetPendientes', xWhere, environment.UrlCONTAAPI);
	}

	getResumen(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetResumen', xWhere, environment.UrlCONTAAPI);
	}

	getMovi(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetMovi', xWhere, environment.UrlCONTAAPI);
	}

	aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCONTAAPI);
	}

	desAplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'DesAplicar', xWhere, environment.UrlCONTAAPI);
	}

	generarConciliacion(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'GenerarConciliacion', xWhere, environment.UrlCONTAAPI);
	}

	reconstruirMovimientos(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ReconstruirMovimientos', xWhere, environment.UrlCONTAAPI);
	}

	forzarConciliacion(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'ForzarConciliacion', [], environment.UrlCONTAAPI);
	}

	revertirConciliacion(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'RevertirConciliacion', [], environment.UrlCONTAAPI);
	}

	marcarConciliado(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'MarcarConciliado', [], environment.UrlCONTAAPI);
	}

	importarExcel(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'ImportarExcel', environment.UrlCONTAAPI);
	}
}
