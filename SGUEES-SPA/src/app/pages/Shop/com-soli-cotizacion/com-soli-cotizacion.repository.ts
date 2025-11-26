import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';
import { ComSoliCotizacionDetaEnca } from './models/com-soli-cotizacion-deta-enca';


@Injectable({
	providedIn: 'root',
})
export class ComSoliCotizacionRepository {
	readonly xController = 'COM_SOLI_COTIZACION';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, '', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, '', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, '', xWhere, environment.UrlCOMPRASAPI);
	}

  createencadeta(model: ComSoliCotizacionDetaEnca): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostCOM_SOLI_COTIZA_ENCA_DETA', environment.UrlCOMPRASAPI);
	}

  Updateencadeta(model: ComSoliCotizacionDetaEnca): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PutCOM_SOLI_COTIZA_ENCA_DETA', environment.UrlCOMPRASAPI);
	}

  getSolicitudCompraDisponible(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get('COM_SOLI_COTIZACION', 'GetAllSOLICITUD_COMPRAS_DISPONIBLE', xWhere, environment.UrlCOMPRASAPI);
	}

  getSolicitudCompraDetaDisponible(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get('COM_SOLI_COTIZACION', 'GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE', xWhere, environment.UrlCOMPRASAPI);
	}

  Solicitar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Solicitar', xWhere, environment.UrlCOMPRASAPI);
	}

  getPDF(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'getPDF', xWhere, environment.UrlCOMPRASAPI);
	}

  Anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Anular', xWhere, environment.UrlCOMPRASAPI);
	}

  Aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCOMPRASAPI);
	}
}
