import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';

@Injectable({
	providedIn: 'root',
})
export class ComDocumentoRepository {
	readonly xController = 'COM_DOCUMENTO';
  readonly xController2 = 'COM_JSON';

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
  Aplicar(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Aplicar', xWhere, environment.UrlCOMPRASAPI);
	}

	GenerarCR(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'GenerarCR', xWhere, environment.UrlCOMPRASAPI);
	}

	AnularCR(model: any, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'AnularCR', xWhere, environment.UrlCOMPRASAPI);
	}

  getALLcOM_JSON(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllJson', xWhere, environment.UrlCOMPRASAPI);
	}
  generarFE(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController2, 'COM_JSON_GENERAR_FE', environment.UrlCOMPRASAPI);
	}
  generarCCF(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController2, 'COM_JSON_GENERAR_CCFE', environment.UrlCOMPRASAPI);
	}
  postPDF(model: FormData): any {
		return this.objData.Post(model, this.xController2, 'PostDoc', environment.UrlCOMPRASAPI);
	}
  getDoc(xWhere: IParam[]): Observable<Blob> {
		return this.objData.GetBlob(this.xController2, 'getDoc', xWhere, environment.UrlCOMPRASAPI);
	}
  generarDCLE(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController2, 'COM_JSON_GENERAR_DCLE', environment.UrlCOMPRASAPI);
	}
  getDisponibles(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDisponibles', xWhere, environment.UrlCOMPRASAPI);
	}

  getALL_COM_DOCUMENTO_CR(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllCOM_DOCUMENTO_CR', xWhere, environment.UrlCOMPRASAPI);
	}
}
