import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';
import { ComSoliCotizacionProveedor } from './models/com-soli-cotizacion-proveedor';

@Injectable({
	providedIn: 'root',
})
export class ComSoliCotizacionProveedorRepository {
	readonly xController = 'COM_SOLI_COTIZACION';

	constructor(private objData: CData) {}

	get(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllCOM_SOLI_COTIZACION_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}

	create(model: ComSoliCotizacionProveedor): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'PostCOM_SOLI_COTIZACION_PROVEEDOR', environment.UrlCOMPRASAPI);
	}

	update(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'PutCOM_SOLI_COTIZACION_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'DeleteCOM_SOLI_COTIZACION_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}

  getProveedoresDisponible(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllPROVEEDOR_DISPONIBLE', xWhere, environment.UrlCOMPRASAPI);
	}

  Anular(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'AnularCOM_SOLI_COTIZACION_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}

  Habilitar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'HabilitarCOM_SOLI_COTIZACION_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}
}
