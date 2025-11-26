import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';
import { ComCuadroComparativoSoliCotizacion } from './models/com-cuadro-comparativo_soli_cotizacion';
import { ComCuadroComparativoCotizacionDeta } from './com-cuadro-comparativo-deta/models/com-cuadro-comparativo-cotizacion-deta';

@Injectable({
	providedIn: 'root',
})
export class ComCuadroComparativoRepository {
	readonly xController = 'COM_CUADRO_COMPARATIVO';
  readonly xControllerCotizacionDoc = 'COM_COTIZACION_DOC';

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

  getSolicitudCompraDisponible(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllSOLICITUD_COTIZACION_DISPONIBLE', xWhere, environment.UrlCOMPRASAPI);
	}

  getAllCOM_SOLI_COTIZACION_PROVEEDOR(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get("COM_SOLI_COTIZACION", 'GetAllCOM_CUADRO_COMPARATIVO_SOLI_COTIZACION_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}

  getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR', xWhere, environment.UrlCOMPRASAPI);
	}

  getAllCOM_SOLI_COTIZACION_DETA(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get("COM_SOLI_COTIZACION", 'GetAllCOM_CUADRO_COMPARATIVO_SOLI_COTIZACION_DETA', xWhere, environment.UrlCOMPRASAPI);
	}

  GenerarCuadroCompartivo(model: ComCuadroComparativoSoliCotizacion): Observable<IResult> {
		return this.objData.Post(model,this.xController, 'COM_CUADRO_COMPARATIVO_GENERAR', environment.UrlCOMPRASAPI);
	}

  Solicitar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Solicitar', xWhere, environment.UrlCOMPRASAPI);
	}

  getPDF(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController, 'getPDF', xWhere, environment.UrlCOMPRASAPI);
	}


  GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA', xWhere, environment.UrlCOMPRASAPI);
	}

  Aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCOMPRASAPI);
	}

  UpdateCuadroCompartivoDeta(model: ComCuadroComparativoCotizacionDeta): Observable<IResult> {
		return this.objData.Post(model,this.xController, 'UPDATE_COM_CUADRO_COMPARATIVO_DETA', environment.UrlCOMPRASAPI);
	}
  getAllCOM_COTIZACION_DOC(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xControllerCotizacionDoc, 'GetAllCOM_CUADRO_COMPARATIVO', xWhere, environment.UrlCOMPRASAPI);
	}
  getDoc(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xControllerCotizacionDoc, 'getDocCOM_CUADRO_COMPARATIVO', xWhere, environment.UrlCOMPRASAPI);
	}
}
